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

  const fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binary = globalThis.atob(fileBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    throw new Error("Görsel R2 üzerine yüklenemedi.");
  }

  return {
    key,
  };
}
