import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";

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
};

type UploadImageToR2Params = {
  imageUri: string;
  key: string;
  contentType: string;
};

async function callR2ObjectFunction(params: {
  action: R2Action;
  key: string;
  contentType?: string;
}) {
  const { data, error } = await supabase.functions.invoke<R2ObjectResponse>(
    "r2-object",
    {
      body: params,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.message ?? "R2 işlemi başarısız oldu.");
  }

  return data;
}

export async function getR2UploadUrl({
  key,
  contentType,
}: GetR2UploadUrlParams) {
  const data = await callR2ObjectFunction({
    action: "upload-url",
    key,
    contentType,
  });

  if (!data.uploadUrl) {
    throw new Error("R2 upload URL oluşturulamadı.");
  }

  return data.uploadUrl;
}

export async function getR2SignedUrl(key: string) {
  const data = await callR2ObjectFunction({
    action: "get-url",
    key,
  });

  if (!data.signedUrl) {
    throw new Error("R2 signed URL oluşturulamadı.");
  }

  return data.signedUrl;
}

export async function deleteR2Object(key: string) {
  await callR2ObjectFunction({
    action: "delete",
    key,
  });

  return true;
}

export async function uploadImageToR2({
  imageUri,
  key,
  contentType,
}: UploadImageToR2Params) {
  const uploadUrl = await getR2UploadUrl({
    key,
    contentType,
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
