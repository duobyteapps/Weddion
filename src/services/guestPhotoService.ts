import { supabase } from "@/lib/supabase";
import {
  deleteR2Object,
  getR2SignedUrl,
  uploadImageToR2,
} from "@/services/r2ImageService";
import type {
  GuestInvitationAccess,
  InvitationGuestPhoto,
  InvitationGuestPhotoStatus,
} from "@/types/invitation";
import { compressImageForUpload } from "@/utils/imageCompression";

export const MAX_PHOTOS_PER_INVITATION = 200;
export const MAX_PHOTOS_PER_UPLOAD = 20;

export type GuestPhotoLimitUsage = {
  used: number;
  limit: number;
  remaining: number;
  maxPerUpload: number;
};

type UploadGuestPhotoParams = {
  invitationId: string;
  guestUploadCode: string;
  imageUri: string;
  guestName?: string;
  guestNote?: string;
};

type UpdateGuestPhotoStatusParams = {
  photoId: string;
  status: InvitationGuestPhotoStatus;
};

const normalizeGuestUploadCode = (code: string) => code.trim().toUpperCase();

export async function getGuestPhotoLimitUsage(
  invitationId: string,
): Promise<GuestPhotoLimitUsage> {
  const { count, error } = await supabase
    .from("invitation_guest_photos")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("invitation_id", invitationId);

  if (error) {
    throw new Error(error.message);
  }

  const used = count ?? 0;
  const remaining = Math.max(MAX_PHOTOS_PER_INVITATION - used, 0);

  return {
    used,
    limit: MAX_PHOTOS_PER_INVITATION,
    remaining,
    maxPerUpload: MAX_PHOTOS_PER_UPLOAD,
  };
}

async function checkGuestPhotoLimit(invitationId: string, incomingCount = 1) {
  const usage = await getGuestPhotoLimitUsage(invitationId);

  if (incomingCount <= 0) {
    throw new Error("Yüklenecek fotoğraf bulunamadı.");
  }

  if (incomingCount > MAX_PHOTOS_PER_UPLOAD) {
    throw new Error(
      `Tek seferde en fazla ${MAX_PHOTOS_PER_UPLOAD} fotoğraf yükleyebilirsiniz.`,
    );
  }

  if (usage.remaining <= 0) {
    throw new Error(
      `Bu davet için en fazla ${MAX_PHOTOS_PER_INVITATION} fotoğraf yüklenebilir.`,
    );
  }

  if (incomingCount > usage.remaining) {
    throw new Error(
      `Bu davette yalnızca ${usage.remaining} fotoğraf yükleme hakkı kaldı.`,
    );
  }

  return usage;
}

export async function validateGuestPhotoBatchLimit(
  invitationId: string,
  selectedPhotoCount: number,
) {
  return checkGuestPhotoLimit(invitationId, selectedPhotoCount);
}

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
  guestName,
  guestNote,
}: UploadGuestPhotoParams) => {
  const normalizedCode = normalizeGuestUploadCode(guestUploadCode);

  await checkGuestPhotoLimit(invitationId, 1);

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

  const { error: insertError } = await supabase
    .from("invitation_guest_photos")
    .insert({
      invitation_id: invitationId,
      storage_path: storagePath,
      public_url: null,
      guest_name: guestName?.trim() || null,
      guest_note: guestNote?.trim() || null,
      upload_code: normalizedCode,
      status: "pending",
    });

  if (insertError) {
    console.log("Guest photo table insert failed:", insertError);

    try {
      await deleteR2Object(storagePath);
    } catch (deleteError) {
      console.log("R2 guest photo rollback delete failed:", deleteError);
    }

    throw new Error(insertError.message);
  }

  return true;
};

export const getGuestPhotosByInvitation = async (invitationId: string) => {
  const { data, error } = await supabase
    .from("invitation_guest_photos")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

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
}: UpdateGuestPhotoStatusParams) => {
  const { data, error } = await supabase
    .from("invitation_guest_photos")
    .update({ status })
    .eq("id", photoId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InvitationGuestPhoto;
};

export const deleteGuestPhoto = async (photo: InvitationGuestPhoto) => {
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
