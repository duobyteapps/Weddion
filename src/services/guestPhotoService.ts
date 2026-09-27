import { supabase } from "@/lib/supabase";

import {
  deleteR2Object,
  finalizeGuestPhotoUpload,
  getR2SignedUrl,
  uploadGuestPhotoSecurely,
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

  const createdPhotos: UploadedGuestPhotoRecord[] = [];

  if (imageUris.length === 0) {
    return true;
  }

  try {
    for (const imageUri of imageUris) {
      /*
       * Fotoğraf önce mobil tarafta
       * maksimum 3 MB olacak şekilde hazırlanır.
       */
      const compressedImage = await compressImageForUpload(imageUri);

      /*
       * ImageManipulator ile sıkıştırılmışsa
       * sonuç JPEG'dir.
       */
      const contentType = compressedImage.wasCompressed
        ? "image/jpeg"
        : getContentTypeFromExtension(
            getFileExtensionFromUri(compressedImage.uri),
          );

      /*
       * Güvenli akış:
       *
       * 1. create-upload
       * 2. doğrudan R2 binary upload
       * 3. confirm-upload
       * 4. gerçek R2 boyut kontrolü
       * 5. DB kaydı
       */
      const uploadResult = await uploadGuestPhotoSecurely({
        invitationId,
        guestUploadCode: normalizedCode,
        imageUri: compressedImage.uri,
        contentType,
        fileSize: compressedImage.size,
      });

      createdPhotos.push(uploadResult.photo as UploadedGuestPhotoRecord);
    }

    /*
     * Tüm fotoğraflar başarıyla yüklendikten sonra
     * backend'e yalnızca oluşturulan gerçek
     * fotoğraf kayıtlarının ID'lerini gönderiyoruz.
     *
     * Backend:
     * - ID'leri doğrular
     * - invitation ID kontrolü yapar
     * - upload code kontrolü yapar
     * - gerçek fotoğraf sayısını belirler
     * - tek bildirim oluşturur
     */
    if (createdPhotos.length > 0) {
      await finalizeGuestPhotoUpload({
        invitationId,
        guestUploadCode: normalizedCode,
        photoIds: createdPhotos.map((photo) => photo.id),
      });
    }

    return true;
  } catch (error) {
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
    .order("created_at", {
      ascending: false,
    })
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
    .update({
      status,
    })
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
    .select("id", {
      count: "exact",
      head: true,
    })
    .in("invitation_id", invitationIds)
    .gt("expires_at", getCurrentIsoDate());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
