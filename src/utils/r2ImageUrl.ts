import { getR2SignedUrl } from "@/services/r2ImageService";

export function isUsableImageUri(value?: string | null) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("file://") ||
    value.startsWith("content://") ||
    value.startsWith("data:image")
  );
}

export function isSignedUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  return (
    value.includes("X-Amz-Signature") ||
    value.includes("X-Amz-Credential") ||
    value.includes("X-Amz-Expires")
  );
}

export async function resolveR2ImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (isUsableImageUri(value)) {
    return value;
  }

  return getR2SignedUrl(value);
}

export function getSafeImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  return value;
}
