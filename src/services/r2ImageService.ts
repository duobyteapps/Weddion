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
};

type SecureGuestPhotoUploadResponse = {
  success: boolean;
  key?: string;
  photo?: unknown;
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

  return "R2 Edge Function çağrısı başarısız oldu.";
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
}: UploadGuestPhotoSecurelyParams) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase env değişkenleri eksik.");
  }

  const session = await getAuthenticatedSession();

  const uploadResponse = await FileSystem.uploadAsync(
    `${supabaseUrl}/functions/v1/guest-photo-upload`,
    imageUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: contentType,
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "x-invitation-id": invitationId,
        "x-upload-code": guestUploadCode.trim().toUpperCase(),
      },
    },
  );

  let responseData: SecureGuestPhotoUploadResponse | null = null;

  try {
    responseData = JSON.parse(
      uploadResponse.body,
    ) as SecureGuestPhotoUploadResponse;
  } catch {
    throw new Error(
      `Fotoğraf yükleme yanıtı okunamadı. HTTP ${uploadResponse.status}`,
    );
  }

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    throw new Error(
      responseData?.message ??
        `Fotoğraf yüklenemedi. HTTP ${uploadResponse.status}`,
    );
  }

  if (!responseData?.success) {
    throw new Error(
      responseData?.message ?? "Fotoğraf güvenli şekilde yüklenemedi.",
    );
  }

  if (!responseData.photo || !responseData.key) {
    throw new Error("Fotoğraf yükleme sonucu alınamadı.");
  }

  return {
    key: responseData.key,
    photo: responseData.photo,
  };
}
