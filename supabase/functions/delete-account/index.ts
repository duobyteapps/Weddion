/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DeleteObjectsCommand, S3Client } from "npm:@aws-sdk/client-s3@3.668.0";

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

function getR2Client() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
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

async function deleteR2Objects(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const bucketName = getRequiredEnv("R2_BUCKET_NAME");
  const r2 = getR2Client();

  for (let index = 0; index < keys.length; index += 1000) {
    const chunk = keys.slice(index, index + 1000);

    await r2.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: chunk.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );
  }
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

    // 1. Profil fotoğrafı varsa R2 path'ini topla
    const { data: profileRows, error: profileError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    collectR2KeysFromRows(profileRows, r2Keys);

    // 2. Kullanıcının davetiyelerini oku
    const { data: invitationRows, error: invitationError } = await adminClient
      .from("user_invitations")
      .select("*")
      .eq("user_id", user.id);

    if (invitationError) {
      throw invitationError;
    }

    // Davetiye tablosundaki user-invitations/... path'lerini topla
    collectR2KeysFromRows(invitationRows, r2Keys);

    const invitationIds = (invitationRows ?? [])
      .map((invitation) => invitation.id)
      .filter((id): id is string => typeof id === "string");

    // 3. Davetiyelere bağlı galeri/misafir fotoğraflarını oku
    if (invitationIds.length > 0) {
      const { data: guestPhotoRows, error: guestPhotoError } = await adminClient
        .from("invitation_guest_photos")
        .select("*")
        .in("invitation_id", invitationIds);

      if (guestPhotoError) {
        throw guestPhotoError;
      }

      // invitation_guest_photos.storage_path içindeki guest-photos/... path'lerini topla
      collectR2KeysFromRows(guestPhotoRows, r2Keys);
    }

    const r2KeyList = [...r2Keys];

    // 4. Önce Cloudflare R2 dosyalarını sil
    await deleteR2Objects(r2KeyList);

    // 5. En son Auth user silinir.
    // Supabase tarafındaki ON DELETE CASCADE ilişkileri diğer kayıtları otomatik temizler.
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id,
    );

    if (deleteUserError) {
      throw deleteUserError;
    }

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
