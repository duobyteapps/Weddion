import { supabase } from "@/lib/supabase";
import {
  deleteR2Object,
  getR2SignedUrl,
  uploadImageToR2,
} from "@/services/r2ImageService";
import { getAuthenticatedUser } from "@/services/sessionService";
import type {
  GuestInvitationAccess,
  InvitationGuestPhoto,
  InvitationGuestPhotoStatus,
} from "@/types/invitation";
import { compressImageForUpload } from "@/utils/imageCompression";

type UploadGuestPhotoParams = {
  invitationId: string;
  guestUploadCode: string;
  imageUri: string;
};

type UploadGuestPhotosParams = {
  invitationId: string;
  guestUploadCode: string;
  imageUris: string[];
};

type UploadedGuestPhotoRecord = {
  id: string;
  invitation_id: string;
  storage_path: string;
  upload_code: string;
  status: InvitationGuestPhotoStatus;
  created_at: string;
  expires_at: string;
};

type UpdateGuestPhotoStatusParams = {
  photoId: string;
  status: InvitationGuestPhotoStatus;
};

export const GUEST_PHOTO_PAGE_SIZE = 30;

type GetGuestPhotosByInvitationParams = {
  invitationId: string;
  page?: number;
  pageSize?: number;
};

const normalizeGuestUploadCode = (code: string) => code.trim().toUpperCase();

const getCurrentIsoDate = () => new Date().toISOString();

const getFileExtensionFromUri = (uri: string) => {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
};

const getContentTypeFromExtension = (extension: string) => {
  switch (extension.toLowerCase()) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
};

const buildGuestPhotoPath = (
  invitationId: string,
  guestUploadCode: string,
  imageUri: string,
  forceJpeg = false,
) => {
  const extension = forceJpeg ? "jpg" : getFileExtensionFromUri(imageUri);

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${extension}`;

  return {
    storagePath: `guest-photos/${invitationId}/${normalizeGuestUploadCode(
      guestUploadCode,
    )}/${fileName}`,
    contentType: forceJpeg
      ? "image/jpeg"
      : getContentTypeFromExtension(extension),
  };
};

export const getInvitationByGuestCode = async (code: string) => {
  const normalizedCode = normalizeGuestUploadCode(code);

  const { data, error } = await supabase.rpc(
    "get_invitation_for_guest_by_code",
    {
      target_code: normalizedCode,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const invitation = data?.[0] as GuestInvitationAccess | undefined;

  return invitation ?? null;
};

export const getInvitationByGuestSlug = async (slug: string) => {
  const normalizedSlug = slug.trim();

  const { data, error } = await supabase.rpc(
    "get_invitation_for_guest_by_slug",
    {
      target_slug: normalizedSlug,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const invitation = data?.[0] as GuestInvitationAccess | undefined;

  return invitation ?? null;
};

export const uploadGuestPhoto = async ({
  invitationId,
  guestUploadCode,
  imageUri,
}: UploadGuestPhotoParams) => {
  return uploadGuestPhotos({
    invitationId,
    guestUploadCode,
    imageUris: [imageUri],
  });
};

export const uploadGuestPhotos = async ({
  invitationId,
  guestUploadCode,
  imageUris,
}: UploadGuestPhotosParams) => {
  const normalizedCode = normalizeGuestUploadCode(guestUploadCode);
  const uploadedStoragePaths: string[] = [];
  const createdPhotos: UploadedGuestPhotoRecord[] = [];

  if (imageUris.length === 0) {
    return true;
  }

  try {
    for (const imageUri of imageUris) {
      const compressedImage = await compressImageForUpload(imageUri);

      const { storagePath, contentType } = buildGuestPhotoPath(
        invitationId,
        normalizedCode,
        compressedImage.uri,
        compressedImage.wasCompressed,
      );

      await uploadImageToR2({
        imageUri: compressedImage.uri,
        key: storagePath,
        contentType,
      });

      uploadedStoragePaths.push(storagePath);

      const { data: createdPhoto, error: uploadRecordError } =
        await supabase.rpc("upload_guest_photo_record", {
          target_invitation_id: invitationId,
          target_upload_code: normalizedCode,
          target_storage_path: storagePath,
        });

      if (uploadRecordError) {
        console.log("Guest photo record RPC failed:", uploadRecordError);

        try {
          await deleteR2Object(storagePath);
        } catch (deleteError) {
          console.log("R2 guest photo rollback delete failed:", deleteError);
        }

        if (uploadRecordError.message.includes("GUEST_PHOTO_LIMIT_REACHED")) {
          throw new Error(
            "Fotoğraf yükleme limiti doldu. Bu hesap için en fazla 100 fotoğraf yüklenebilir.",
          );
        }

        throw new Error(uploadRecordError.message);
      }

      if (createdPhoto) {
        createdPhotos.push(createdPhoto as UploadedGuestPhotoRecord);
      }
    }

    if (createdPhotos.length > 0) {
      const { error: notificationError } = await supabase.rpc(
        "create_guest_photo_upload_notification",
        {
          target_invitation_id: invitationId,
          target_upload_code: normalizedCode,
          target_photo_count: createdPhotos.length,
          target_first_photo_id: createdPhotos[0]?.id ?? null,
        },
      );

      if (notificationError) {
        console.log("Guest photo notification RPC failed:", notificationError);
      }
    }

    return true;
  } catch (error) {
    await Promise.allSettled(
      uploadedStoragePaths.map((storagePath) => deleteR2Object(storagePath)),
    );

    console.log("Guest photo upload failed:", error);

    throw new Error(
      error instanceof Error ? error.message : "Fotoğraflar yüklenemedi.",
    );
  }
};

export const getGuestPhotosByInvitation = async ({
  invitationId,
  page = 0,
  pageSize = GUEST_PHOTO_PAGE_SIZE,
}: GetGuestPhotosByInvitationParams): Promise<InvitationGuestPhoto[]> => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("invitation_guest_photos")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const photos = (data ?? []) as InvitationGuestPhoto[];

  const photosWithSignedUrls = await Promise.all(
    photos.map(async (photo) => {
      try {
        const signedUrl = await getR2SignedUrl(photo.storage_path);

        return {
          ...photo,
          public_url: signedUrl,
        };
      } catch (signedUrlError) {
        console.log(
          "Guest photo R2 signed url oluşturulamadı:",
          signedUrlError,
        );

        return {
          ...photo,
          public_url: null,
        };
      }
    }),
  );

  return photosWithSignedUrls;
};

export const updateGuestPhotoStatus = async ({
  photoId,
  status,
}: UpdateGuestPhotoStatusParams): Promise<InvitationGuestPhoto> => {
  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("invitation_guest_photos")
    .update({ status })
    .eq("id", photoId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...(data as Omit<InvitationGuestPhoto, "public_url">),
    public_url: null,
  };
};

export const deleteGuestPhoto = async (photo: InvitationGuestPhoto) => {
  await getAuthenticatedUser();

  await deleteR2Object(photo.storage_path);

  const { error: deleteError } = await supabase
    .from("invitation_guest_photos")
    .delete()
    .eq("id", photo.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return true;
};

export async function getCurrentUserGuestPhotoCount(): Promise<number> {
  const user = await getAuthenticatedUser();

  const { data: invitations, error: invitationsError } = await supabase
    .from("user_invitations")
    .select("id")
    .eq("user_id", user.id);

  if (invitationsError) {
    throw new Error(invitationsError.message);
  }

  const invitationIds = (invitations ?? []).map((invitation) => invitation.id);

  if (invitationIds.length === 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from("invitation_guest_photos")
    .select("id", { count: "exact", head: true })
    .in("invitation_id", invitationIds)
    .gt("expires_at", getCurrentIsoDate());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
