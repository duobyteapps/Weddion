import * as ImagePicker from "expo-image-picker";

import {
    deleteR2Object,
    getR2SignedUrl,
    uploadImageToR2,
} from "@/services/r2ImageService";
import { getAuthenticatedUser } from "@/services/sessionService";

type UploadProfileImageResult = {
  avatarUrl: string;
  avatarPath: string;
};

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function getFileExtensionFromUri(uri: string) {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
}

function getContentTypeFromExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

export async function pickAndUploadProfileImage(): Promise<UploadProfileImageResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Profil fotoğrafı seçmek için galeri izni vermelisiniz.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled) {
    return null;
  }

  const selectedImage = result.assets[0];

  if (!selectedImage?.uri) {
    throw new Error("Fotoğraf seçilemedi.");
  }

  if (
    selectedImage.fileSize &&
    selectedImage.fileSize > MAX_PROFILE_IMAGE_SIZE
  ) {
    throw new Error("Profil fotoğrafı en fazla 5MB olabilir.");
  }

  const user = await getAuthenticatedUser();

  const extension = getFileExtensionFromUri(selectedImage.uri);
  const contentType =
    selectedImage.mimeType ?? getContentTypeFromExtension(extension);

  const avatarPath = `profile-photos/${user.id}/avatar-${Date.now()}.${extension}`;

  await uploadImageToR2({
    imageUri: selectedImage.uri,
    key: avatarPath,
    contentType,
    requireAuth: true,
  });

  const avatarUrl = await getR2SignedUrl(avatarPath, true);

  return {
    avatarUrl,
    avatarPath,
  };
}

export async function deleteProfileImage(
  avatarPath: string | null | undefined,
) {
  if (!avatarPath) {
    return;
  }

  await deleteR2Object(avatarPath, true);
}
