import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library/legacy";

type DownloadImageToGalleryParams = {
  imageUri: string | null | undefined;
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
  const normalizedPrefix = normalizeTurkishText(fileNamePrefix);

  return `${normalizedPrefix}-${timestamp}`;
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
  const extension = getFileExtensionFromUri(imageUri);
  const fileName = `${createDownloadFileName(fileNamePrefix)}.${extension}`;
  const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.copyAsync({
    from: imageUri,
    to: destinationUri,
  });

  return destinationUri;
}

async function prepareImageForMediaLibrary(
  imageUri: string,
  fileNamePrefix?: string,
) {
  if (imageUri.startsWith("data:image")) {
    return writeBase64ImageToCache(imageUri, fileNamePrefix);
  }

  if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
    return downloadRemoteImageToCache(imageUri, fileNamePrefix);
  }

  if (imageUri.startsWith("file://")) {
    return imageUri;
  }

  if (imageUri.startsWith("content://")) {
    return copyLocalImageToCache(imageUri, fileNamePrefix);
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
