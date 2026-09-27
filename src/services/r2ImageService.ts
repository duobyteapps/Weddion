import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";
import { getAuthenticatedSession } from "@/services/sessionService";

type R2Action = "upload-url" | "get-url" | "delete";

type R2ObjectResponse = {
  success: boolean;
  uploadUrl?: string;
  signedUrl?: string;
  key?: string;
  message?: string;
};

type GetR2UploadUrlParams = {
  key: string;
  contentType: string;
  requireAuth?: boolean;
};

type UploadImageToR2Params = {
  imageUri: string;
  key: string;
  contentType: string;
  requireAuth?: boolean;
};

type R2FunctionParams = {
  action: R2Action;
  key: string;
  contentType?: string;
  requireAuth?: boolean;
};

type UploadGuestPhotoSecurelyParams = {
  invitationId: string;
  guestUploadCode: string;
  imageUri: string;
  contentType: string;
  fileSize: number;
};

type GuestPhotoUploadResponse = {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  contentType?: string;
  fileSize?: number;
  expiresIn?: number;
  photo?: unknown;
  notificationId?: string | null;
  photoCount?: number;
  code?: string;
  message?: string;
};

function isDirectUrl(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("file://") ||
    value.startsWith("content://") ||
    value.startsWith("data:image")
  );
}

async function getFunctionErrorMessage(error: unknown) {
  const context =
    error &&
    typeof error === "object" &&
    "context" in error &&
    error.context instanceof Response
      ? error.context
      : null;

  if (context) {
    try {
      const errorBody = await context.clone().json();

      if (errorBody?.message) {
        return String(errorBody.message);
      }

      if (errorBody?.error) {
        return String(errorBody.error);
      }

      return JSON.stringify(errorBody);
    } catch {
      try {
        const errorText = await context.clone().text();

        if (errorText) {
          return errorText;
        }
      } catch {
        // ignore
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Edge Function çağrısı başarısız oldu.";
}

async function callR2ObjectFunction({
  requireAuth = false,
  ...params
}: R2FunctionParams) {
  const session = requireAuth ? await getAuthenticatedSession() : null;

  const { data, error } = await supabase.functions.invoke<R2ObjectResponse>(
    "r2-object",
    {
      body: params,
      headers: session
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : undefined,
    },
  );

  if (error) {
    const message = await getFunctionErrorMessage(error);

    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(data?.message ?? "R2 işlemi başarısız oldu.");
  }

  return data;
}

async function readImageAsBytes(imageUri: string) {
  const fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binary = globalThis.atob(fileBase64);

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function createGuestPhotoUpload({
  invitationId,
  guestUploadCode,
  contentType,
  fileSize,
}: {
  invitationId: string;
  guestUploadCode: string;
  contentType: string;
  fileSize: number;
}) {
  const { data, error } =
    await supabase.functions.invoke<GuestPhotoUploadResponse>(
      "guest-photo-upload",
      {
        body: {
          action: "create-upload",
          invitationId,
          uploadCode: guestUploadCode.trim().toUpperCase(),
          contentType,
          fileSize,
        },
      },
    );

  if (error) {
    const message = await getFunctionErrorMessage(error);

    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(
      data?.message ?? "Fotoğraf yükleme bağlantısı oluşturulamadı.",
    );
  }

  if (!data.uploadUrl || !data.key) {
    throw new Error("Fotoğraf yükleme bağlantısı alınamadı.");
  }

  return {
    uploadUrl: data.uploadUrl,
    key: data.key,
  };
}

async function confirmGuestPhotoUpload({
  invitationId,
  guestUploadCode,
  key,
}: {
  invitationId: string;
  guestUploadCode: string;
  key: string;
}) {
  const { data, error } =
    await supabase.functions.invoke<GuestPhotoUploadResponse>(
      "guest-photo-upload",
      {
        body: {
          action: "confirm-upload",
          invitationId,
          uploadCode: guestUploadCode.trim().toUpperCase(),
          key,
        },
      },
    );

  if (error) {
    const message = await getFunctionErrorMessage(error);

    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(data?.message ?? "Fotoğraf yüklemesi doğrulanamadı.");
  }

  if (!data.photo || !data.key) {
    throw new Error("Fotoğraf yükleme sonucu alınamadı.");
  }

  return {
    key: data.key,
    photo: data.photo,
  };
}

export async function finalizeGuestPhotoUpload({
  invitationId,
  guestUploadCode,
  photoIds,
}: {
  invitationId: string;
  guestUploadCode: string;
  photoIds: string[];
}) {
  if (photoIds.length === 0) {
    return true;
  }

  const { data, error } =
    await supabase.functions.invoke<GuestPhotoUploadResponse>(
      "guest-photo-upload",
      {
        body: {
          action: "finalize-upload",
          invitationId,
          uploadCode: guestUploadCode.trim().toUpperCase(),
          photoIds,
        },
      },
    );

  if (error) {
    const message = await getFunctionErrorMessage(error);

    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(
      data?.message ?? "Fotoğraf yükleme bildirimi oluşturulamadı.",
    );
  }

  return true;
}

export async function getR2UploadUrl({
  key,
  contentType,
  requireAuth = false,
}: GetR2UploadUrlParams) {
  const data = await callR2ObjectFunction({
    action: "upload-url",
    key,
    contentType,
    requireAuth,
  });

  if (!data.uploadUrl) {
    throw new Error("R2 upload URL oluşturulamadı.");
  }

  return data.uploadUrl;
}

export async function getR2SignedUrl(key: string, requireAuth = false) {
  if (isDirectUrl(key)) {
    return key;
  }

  const data = await callR2ObjectFunction({
    action: "get-url",
    key,
    requireAuth,
  });

  if (!data.signedUrl) {
    throw new Error("R2 signed URL oluşturulamadı.");
  }

  return data.signedUrl;
}

export async function deleteR2Object(key: string, requireAuth = false) {
  if (isDirectUrl(key)) {
    return true;
  }

  await callR2ObjectFunction({
    action: "delete",
    key,
    requireAuth,
  });

  return true;
}

export async function uploadImageToR2({
  imageUri,
  key,
  contentType,
  requireAuth = false,
}: UploadImageToR2Params) {
  const uploadUrl = await getR2UploadUrl({
    key,
    contentType,
    requireAuth,
  });

  const bytes = await readImageAsBytes(imageUri);

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    let message = "Görsel R2 üzerine yüklenemedi.";

    try {
      const errorText = await uploadResponse.text();

      if (errorText) {
        message = `${message} ${errorText}`;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return {
    key,
  };
}

export async function uploadGuestPhotoSecurely({
  invitationId,
  guestUploadCode,
  imageUri,
  contentType,
  fileSize,
}: UploadGuestPhotoSecurelyParams) {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw new Error("Fotoğraf boyutu belirlenemedi.");
  }

  /*
   * 1. Supabase'ten bu fotoğraf için kısa süreli
   * R2 upload URL'si al.
   *
   * Burada login/session gerekmiyor.
   * Güvenlik davet ID + upload code üzerinden sağlanıyor.
   */
  const { uploadUrl, key } = await createGuestPhotoUpload({
    invitationId,
    guestUploadCode,
    contentType,
    fileSize,
  });

  /*
   * 2. Fotoğrafı Edge Function üzerinden geçirmek yerine
   * doğrudan R2'ye binary olarak yükle.
   *
   * MULTIPART kullanmıyoruz.
   */
  const uploadResponse = await FileSystem.uploadAsync(uploadUrl, imageUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
    },
  });

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    let message = `Fotoğraf R2 üzerine yüklenemedi. HTTP ${uploadResponse.status}`;

    if (uploadResponse.body?.trim()) {
      message = `${message} ${uploadResponse.body}`;
    }

    throw new Error(message);
  }

  /*
   * 3. R2 yüklemesinden sonra Supabase gerçek objeyi
   * HEAD isteğiyle kontrol eder.
   *
   * Burada gerçek ContentLength tekrar kontrol edilir.
   * Uygunsa invitation_guest_photos kaydı oluşturulur.
   */
  return confirmGuestPhotoUpload({
    invitationId,
    guestUploadCode,
    key,
  });
}
