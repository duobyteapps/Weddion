import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";
import type {
    GuestInvitationAccess,
    InvitationGuestPhoto,
    InvitationGuestPhotoStatus,
} from "@/types/invitation";

const GUEST_PHOTOS_BUCKET = "guest-photos";

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
) => {
  const extension = getFileExtensionFromUri(imageUri);
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${extension}`;

  return {
    storagePath: `${invitationId}/${normalizeGuestUploadCode(
      guestUploadCode,
    )}/${fileName}`,
    contentType: getContentTypeFromExtension(extension),
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

  const { storagePath, contentType } = buildGuestPhotoPath(
    invitationId,
    normalizedCode,
    imageUri,
  );

  const base64File = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error: uploadError } = await supabase.storage
    .from(GUEST_PHOTOS_BUCKET)
    .upload(storagePath, decode(base64File), {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

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

    await supabase.storage.from(GUEST_PHOTOS_BUCKET).remove([storagePath]);

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

  return (data ?? []) as InvitationGuestPhoto[];
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
  const { error: storageError } = await supabase.storage
    .from(GUEST_PHOTOS_BUCKET)
    .remove([photo.storage_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("invitation_guest_photos")
    .delete()
    .eq("id", photo.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return true;
};
