import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "npm:@aws-sdk/client-s3@3.668.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.668.0";
import { createClient, type User } from "npm:@supabase/supabase-js@2.57.4";

type R2Action = "upload-url" | "get-url" | "delete";
type R2RequestBody = { action?: R2Action; key?: string; contentType?: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} secret değeri bulunamadı.`);
  return value;
}

function validateObjectKey(key: string) {
  const cleanKey = key.trim();
  if (!cleanKey || cleanKey.startsWith("/") || cleanKey.includes("..")) {
    throw new Error("R2 object key geçersiz.");
  }
  const parts = cleanKey.split("/");
  if (parts.some((part) => !part)) throw new Error("R2 object key geçersiz.");
  return { cleanKey, parts };
}

function getR2Client() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function getSupabaseAdmin() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function getRequestUser(req: Request): Promise<User | null> {
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  return error ? null : data.user;
}

async function isAdmin(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function canManageInvitation(userId: string, invitationId: string) {
  const supabase = getSupabaseAdmin();
  const { data: invitation, error: invitationError } = await supabase
    .from("user_invitations")
    .select("id")
    .eq("id", invitationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (invitationError) throw invitationError;
  if (invitation) return true;

  const { data: member, error: memberError } = await supabase
    .from("invitation_gallery_members")
    .select("id")
    .eq("invitation_id", invitationId)
    .eq("user_id", userId)
    .eq("role", "partner")
    .eq("status", "active")
    .maybeSingle();
  if (memberError) throw memberError;
  return Boolean(member);
}

async function hasValidGuestUploadAccess(
  invitationId: string,
  uploadCode: string,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("user_invitations")
    .select("guest_upload_expires_at")
    .eq("id", invitationId)
    .eq("guest_upload_code", uploadCode.toUpperCase())
    .eq("guest_upload_enabled", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  return (
    !data.guest_upload_expires_at ||
    new Date(data.guest_upload_expires_at).getTime() > Date.now()
  );
}

async function isRegisteredGuestPhoto(key: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("invitation_guest_photos")
    .select("id")
    .eq("storage_path", key)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function isKnownActiveTemplatePath(key: string) {
  const supabase = getSupabaseAdmin();
  const columns = ["image_path", "editable_image_path", "content_image_path"];
  for (const column of columns) {
    const { data, error } = await supabase
      .from("invitation_templates")
      .select("id")
      .eq("is_active", true)
      .eq(column, key)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return true;
  }
  return false;
}

async function authorizeR2Action(
  req: Request,
  action: R2Action,
  key: string,
  parts: string[],
) {
  const user = await getRequestUser(req);
  const prefix = parts[0];

  if (prefix === "profile-photos") {
    return Boolean(user && parts.length >= 3 && parts[1] === user.id);
  }

  if (prefix === "user-invitations") {
    if (!user || parts.length < 4 || parts[1] !== user.id) return false;
    return canManageInvitation(user.id, parts[2]);
  }

  if (prefix === "invitation-templates") {
    if (action === "get-url") return isKnownActiveTemplatePath(key);
    return Boolean(user && (await isAdmin(user.id)));
  }

  if (prefix === "guest-photos") {
    if (parts.length < 4) return false;
    const invitationId = parts[1];
    const uploadCode = parts[2];

    if (action === "upload-url") {
      return hasValidGuestUploadAccess(invitationId, uploadCode);
    }
    if (user && (await canManageInvitation(user.id, invitationId))) return true;

    // Mevcut rollback akışını korur; kayıtlı galeri fotoğrafı anonim silinemez.
    if (action === "delete") {
      if (!(await hasValidGuestUploadAccess(invitationId, uploadCode)))
        return false;
      return !(await isRegisteredGuestPhoto(key));
    }
    return false;
  }

  return false;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return jsonResponse(
        { success: false, message: "Sadece POST isteği desteklenir." },
        405,
      );
    }
    const body = (await req.json()) as R2RequestBody;
    if (!body.action || !body.key) {
      return jsonResponse(
        { success: false, message: "action ve key alanları zorunludur." },
        400,
      );
    }

    const { cleanKey: key, parts } = validateObjectKey(body.key);
    if (!(await authorizeR2Action(req, body.action, key, parts))) {
      return jsonResponse(
        { success: false, message: "Bu R2 işlemi için yetkiniz yok." },
        403,
      );
    }

    const bucketName = getRequiredEnv("R2_BUCKET_NAME");
    const r2 = getR2Client();

    if (body.action === "upload-url") {
      const contentType = body.contentType || "application/octet-stream";
      if (!contentType.startsWith("image/")) {
        return jsonResponse(
          {
            success: false,
            message: "Sadece image/* dosya tipleri yüklenebilir.",
          },
          400,
        );
      }
      const uploadUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn: 60 * 5 },
      );
      return jsonResponse({ success: true, uploadUrl, key });
    }

    if (body.action === "get-url") {
      const signedUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
        { expiresIn: 60 * 60 },
      );
      return jsonResponse({ success: true, signedUrl, key });
    }

    if (body.action === "delete") {
      await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
      return jsonResponse({ success: true, key });
    }

    return jsonResponse(
      { success: false, message: "Geçersiz action değeri." },
      400,
    );
  } catch (error) {
    console.error("R2 Edge Function error:", error);
    return jsonResponse(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "R2 işlemi sırasında hata oluştu.",
      },
      500,
    );
  }
});
