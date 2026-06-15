import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const QUALITY_ONLY_STEPS = [0.95, 0.92, 0.9, 0.88, 0.85, 0.8, 0.75];
const WIDTH_STEPS = [3000, 2600, 2200, 2000, 1800, 1600];

type CompressImageResult = {
  uri: string;
  size: number;
  width?: number;
  height?: number;
  wasCompressed: boolean;
};

async function getFileInfo(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new Error("Fotoğraf dosyası bulunamadı.");
  }

  return info;
}

function getFileSize(info: FileSystem.FileInfo) {
  if ("size" in info && typeof info.size === "number") {
    return info.size;
  }

  return 0;
}

export async function compressImageForUpload(
  imageUri: string,
): Promise<CompressImageResult> {
  const originalInfo = await getFileInfo(imageUri);
  const originalSize = getFileSize(originalInfo);

  if (originalSize > 0 && originalSize <= MAX_IMAGE_SIZE_BYTES) {
    return {
      uri: imageUri,
      size: originalSize,
      wasCompressed: false,
    };
  }

  let lastResult: ImageManipulator.ImageResult | null = null;
  let lastSize = Number.MAX_SAFE_INTEGER;

  // Önce çözünürlüğe dokunmadan sadece kaliteyi düşür.
  // Böylece 12 MB gibi fotoğraflar gereksiz yere 1 MB seviyesine ezilmez.
  for (const quality of QUALITY_ONLY_STEPS) {
    const result = await ImageManipulator.manipulateAsync(imageUri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const resultInfo = await getFileInfo(result.uri);
    const resultSize = getFileSize(resultInfo);

    lastResult = result;
    lastSize = resultSize;

    if (resultSize <= MAX_IMAGE_SIZE_BYTES) {
      return {
        uri: result.uri,
        size: resultSize,
        width: result.width,
        height: result.height,
        wasCompressed: true,
      };
    }
  }

  // Hâlâ 3 MB üstündeyse çözünürlüğü kademeli düşür.
  // 1600px altına inmiyoruz; kalite çok ezilmesin.
  for (const width of WIDTH_STEPS) {
    for (const quality of QUALITY_ONLY_STEPS) {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width,
            },
          },
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const resultInfo = await getFileInfo(result.uri);
      const resultSize = getFileSize(resultInfo);

      lastResult = result;
      lastSize = resultSize;

      if (resultSize <= MAX_IMAGE_SIZE_BYTES) {
        return {
          uri: result.uri,
          size: resultSize,
          width: result.width,
          height: result.height,
          wasCompressed: true,
        };
      }
    }
  }

  if (!lastResult || lastSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Fotoğraf 3 MB altına sıkıştırılamadı.");
  }

  return {
    uri: lastResult.uri,
    size: lastSize,
    width: lastResult.width,
    height: lastResult.height,
    wasCompressed: true,
  };
}

export const MAX_UPLOAD_IMAGE_SIZE_MB = 3;
