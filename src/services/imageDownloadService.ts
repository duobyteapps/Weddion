import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library/legacy";

type DownloadImageToGalleryParams = {
  imageUri: string | null | undefined;
  fileNamePrefix?: string;
};

type DownloadImagesToGalleryParams = {
  imageUris: string[];
  fileNamePrefix?: string;
};

function normalizeTurkishText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createDownloadFileName(fileNamePrefix = "weddion-gorsel") {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  const normalizedPrefix = normalizeTurkishText(fileNamePrefix);

  return `${normalizedPrefix}-${timestamp}-${randomPart}`;
}

function normalizeImageUri(imageUri: string) {
  const trimmedImageUri = imageUri.trim();

  if (
    trimmedImageUri.startsWith("data:image") ||
    trimmedImageUri.startsWith("file://") ||
    trimmedImageUri.startsWith("http://") ||
    trimmedImageUri.startsWith("https://") ||
    trimmedImageUri.startsWith("content://")
  ) {
    return trimmedImageUri;
  }

  if (trimmedImageUri.startsWith("/")) {
    return `file://${trimmedImageUri}`;
  }

  return trimmedImageUri;
}

function getFileExtensionFromUri(imageUri: string) {
  if (imageUri.startsWith("data:image")) {
    const base64Match = imageUri.match(
      /^data:image\/(png|jpg|jpeg|webp);base64,/i,
    );

    if (base64Match?.[1]) {
      const extension = base64Match[1].toLowerCase();

      return extension === "jpeg" ? "jpg" : extension;
    }

    return "png";
  }

  const cleanUri = imageUri.split("?")[0] ?? imageUri;
  const extensionMatch = cleanUri.match(/\.(png|jpg|jpeg|webp)$/i);

  if (!extensionMatch?.[1]) {
    return "png";
  }

  const extension = extensionMatch[1].toLowerCase();

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
}

function getBase64DataFromImageUri(imageUri: string) {
  const match = imageUri.match(
    /^data:image\/(png|jpg|jpeg|webp);base64,(.+)$/i,
  );

  if (!match?.[2]) {
    throw new Error("INVALID_BASE64_IMAGE");
  }

  const extension = match[1].toLowerCase();

  return {
    extension: extension === "jpeg" ? "jpg" : extension,
    base64Data: match[2],
  };
}

async function writeBase64ImageToCache(
  imageUri: string,
  fileNamePrefix?: string,
) {
  const { extension, base64Data } = getBase64DataFromImageUri(imageUri);
  const fileName = `${createDownloadFileName(fileNamePrefix)}.${extension}`;
  const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(destinationUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return destinationUri;
}

async function downloadRemoteImageToCache(
  imageUri: string,
  fileNamePrefix?: string,
) {
  const extension = getFileExtensionFromUri(imageUri);
  const fileName = `${createDownloadFileName(fileNamePrefix)}.${extension}`;
  const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

  const result = await FileSystem.downloadAsync(imageUri, destinationUri);

  return result.uri;
}

async function copyLocalImageToCache(
  imageUri: string,
  fileNamePrefix?: string,
) {
  const normalizedImageUri = normalizeImageUri(imageUri);
  const extension = getFileExtensionFromUri(normalizedImageUri);
  const fileName = `${createDownloadFileName(fileNamePrefix)}.${extension}`;
  const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.copyAsync({
    from: normalizedImageUri,
    to: destinationUri,
  });

  return destinationUri;
}

async function prepareImageForMediaLibrary(
  imageUri: string,
  fileNamePrefix?: string,
) {
  const normalizedImageUri = normalizeImageUri(imageUri);

  if (normalizedImageUri.startsWith("data:image")) {
    return writeBase64ImageToCache(normalizedImageUri, fileNamePrefix);
  }

  if (
    normalizedImageUri.startsWith("http://") ||
    normalizedImageUri.startsWith("https://")
  ) {
    return downloadRemoteImageToCache(normalizedImageUri, fileNamePrefix);
  }

  if (normalizedImageUri.startsWith("file://")) {
    return copyLocalImageToCache(normalizedImageUri, fileNamePrefix);
  }

  if (normalizedImageUri.startsWith("content://")) {
    return copyLocalImageToCache(normalizedImageUri, fileNamePrefix);
  }

  throw new Error("UNSUPPORTED_IMAGE_URI");
}

export async function requestGallerySavePermission() {
  const permission = await MediaLibrary.requestPermissionsAsync(true);

  return permission.status === "granted";
}

export async function downloadImageToGallery({
  imageUri,
  fileNamePrefix = "weddion-gorsel",
}: DownloadImageToGalleryParams) {
  if (!imageUri) {
    throw new Error("IMAGE_URI_REQUIRED");
  }

  const hasPermission = await requestGallerySavePermission();

  if (!hasPermission) {
    throw new Error("GALLERY_PERMISSION_DENIED");
  }

  const localImageUri = await prepareImageForMediaLibrary(
    imageUri,
    fileNamePrefix,
  );

  await MediaLibrary.saveToLibraryAsync(localImageUri);

  return localImageUri;
}

export async function downloadImagesToGallery({
  imageUris,
  fileNamePrefix = "weddion-galeri",
}: DownloadImagesToGalleryParams) {
  const validImageUris = imageUris.filter(Boolean);

  if (validImageUris.length === 0) {
    throw new Error("IMAGE_URIS_REQUIRED");
  }

  const hasPermission = await requestGallerySavePermission();

  if (!hasPermission) {
    throw new Error("GALLERY_PERMISSION_DENIED");
  }

  const downloadedUris: string[] = [];

  for (const imageUri of validImageUris) {
    const localImageUri = await prepareImageForMediaLibrary(
      imageUri,
      fileNamePrefix,
    );

    await MediaLibrary.saveToLibraryAsync(localImageUri);

    downloadedUris.push(localImageUri);
  }

  return downloadedUris;
}
