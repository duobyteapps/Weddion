/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedR2Prefixes = [
  "profile-photos/",
  "user-invitations/",
  "guest-photos/",
];

const R2_DELETE_TIMEOUT_MS = 15000;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} secret değeri bulunamadı.`);
  }

  return value;
}

function getR2AwsClient() {
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

  return new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

function encodeR2KeyForUrl(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function normalizeR2Key(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  for (const prefix of allowedR2Prefixes) {
    const prefixIndex = trimmedValue.indexOf(prefix);

    if (prefixIndex === -1) {
      continue;
    }

    const keyWithPossibleQuery = trimmedValue.slice(prefixIndex);
    const keyWithoutQuery = keyWithPossibleQuery.split("?")[0] ?? "";

    try {
      return decodeURIComponent(keyWithoutQuery);
    } catch {
      return keyWithoutQuery;
    }
  }

  return null;
}

function collectR2KeysFromValue(value: unknown, output: Set<string>) {
  if (typeof value === "string") {
    const key = normalizeR2Key(value);

    if (key) {
      output.add(key);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectR2KeysFromValue(item, output);
    }

    return;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectR2KeysFromValue(item, output);
    }
  }
}

function collectR2KeysFromRows(rows: unknown[] | null, output: Set<string>) {
  for (const row of rows ?? []) {
    collectR2KeysFromValue(row, output);
  }
}

async function deleteSingleR2Object(key: string) {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");
  const r2 = getR2AwsClient();

  const encodedBucketName = encodeURIComponent(bucketName);
  const encodedKey = encodeR2KeyForUrl(key);

  const objectUrl = `https://${accountId}.r2.cloudflarestorage.com/${encodedBucketName}/${encodedKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, R2_DELETE_TIMEOUT_MS);

  try {
    console.log("R2 delete request started:", key);

    const response = await r2.fetch(objectUrl, {
      method: "DELETE",
      signal: controller.signal,
    });

    const isSuccess =
      response.status === 200 ||
      response.status === 202 ||
      response.status === 204 ||
      response.status === 404;

    if (!isSuccess) {
      const responseText = await response.text().catch(() => "");

      throw new Error(
        `R2 obje silinemedi. Status: ${response.status}. Key: ${key}. Response: ${responseText}`,
      );
    }

    console.log("R2 delete request finished:", {
      key,
      status: response.status,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`R2 silme işlemi zaman aşımına uğradı. Key: ${key}`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function deleteR2Objects(keys: string[]) {
  if (keys.length === 0) {
    console.log("R2 delete skipped. No keys.");
    return;
  }

  console.log("R2 delete started. Key count:", keys.length);
  console.log("R2 delete keys:", keys);

  for (const key of keys) {
    await deleteSingleR2Object(key);
  }

  console.log("R2 delete finished.");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse(
        {
          success: false,
          message: "Sadece POST isteği desteklenir.",
        },
        405,
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        {
          success: false,
          message: "Oturum bulunamadı.",
        },
        401,
      );
    }

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        {
          success: false,
          message: "Oturum doğrulanamadı.",
        },
        401,
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const r2Keys = new Set<string>();

    console.log("delete-account started:", user.id);

    const { data: profileRows, error: profileError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    collectR2KeysFromRows(profileRows, r2Keys);

    const { data: invitationRows, error: invitationError } = await adminClient
      .from("user_invitations")
      .select("*")
      .eq("user_id", user.id);

    if (invitationError) {
      throw invitationError;
    }

    collectR2KeysFromRows(invitationRows, r2Keys);

    const invitationIds = (invitationRows ?? [])
      .map((invitation) => invitation.id)
      .filter((id): id is string => typeof id === "string");

    if (invitationIds.length > 0) {
      const { data: guestPhotoRows, error: guestPhotoError } = await adminClient
        .from("invitation_guest_photos")
        .select("*")
        .in("invitation_id", invitationIds);

      if (guestPhotoError) {
        throw guestPhotoError;
      }

      collectR2KeysFromRows(guestPhotoRows, r2Keys);
    }

    const r2KeyList = [...r2Keys];

    console.log("delete-account invitation count:", invitationIds.length);
    console.log("delete-account R2 key count:", r2KeyList.length);
    console.log("delete-account R2 keys:", r2KeyList);

    // Önce Cloudflare R2 dosyaları silinir.
    // R2 silinemezse hesap silinmez. Böylece Cloudflare'da sahipsiz veri bırakmayız.
    await deleteR2Objects(r2KeyList);

    // R2 başarılıysa Auth user silinir.
    // Supabase tarafındaki ON DELETE CASCADE ilişkileri bağlı DB kayıtlarını temizler.
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id,
    );

    if (deleteUserError) {
      console.log("delete-account auth delete error:", deleteUserError);
      throw deleteUserError;
    }

    console.log("delete-account auth user deleted:", user.id);

    return jsonResponse({
      success: true,
      deletedR2ObjectCount: r2KeyList.length,
      deletedInvitationCount: invitationIds.length,
    });
  } catch (error) {
    console.log("Delete account error:", error);

    return jsonResponse(
      {
        success: false,
        message: error instanceof Error ? error.message : "Hesap silinemedi.",
      },
      500,
    );
  }
});
