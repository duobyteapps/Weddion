import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "npm:@aws-sdk/client-s3@3.668.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.668.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const UPLOAD_URL_EXPIRES_SECONDS = 60 * 2;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type GuestPhotoUploadAction =
  | "create-upload"
  | "confirm-upload"
  | "finalize-upload";

type GuestPhotoUploadBody = {
  action?: GuestPhotoUploadAction;
  invitationId?: string;
  uploadCode?: string;
  contentType?: string;
  fileSize?: number;
  key?: string;
  photoIds?: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

function getSupabaseAdmin() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
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

function normalizeUploadCode(value: string) {
  return value.trim().toUpperCase();
}

function normalizeContentType(value: string) {
  return value.trim().toLowerCase();
}

function getExtension(contentType: string) {
  switch (contentType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/heic":
      return "heic";

    case "image/heif":
      return "heif";

    default:
      return "jpg";
  }
}

async function hasValidGuestUploadAccess(
  invitationId: string,
  uploadCode: string,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("user_invitations")
    .select("id")
    .eq("id", invitationId)
    .eq("guest_upload_code", uploadCode)
    .eq("guest_upload_enabled", true)
    .or(
      `guest_upload_expires_at.is.null,guest_upload_expires_at.gt.${new Date().toISOString()}`,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

function isExpectedGuestPhotoKey(
  key: string,
  invitationId: string,
  uploadCode: string,
) {
  const expectedPrefix = `guest-photos/${invitationId}/${uploadCode}/`;

  return (
    key.startsWith(expectedPrefix) &&
    !key.includes("..") &&
    !key.startsWith("/")
  );
}

async function deleteR2Object(key: string) {
  const r2 = getR2Client();
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");

  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

async function createUpload(body: GuestPhotoUploadBody) {
  const invitationId = (body.invitationId ?? "").trim();
  const uploadCode = normalizeUploadCode(body.uploadCode ?? "");
  const contentType = normalizeContentType(body.contentType ?? "");
  const fileSize = Number(body.fileSize ?? 0);

  if (!invitationId || !uploadCode) {
    return jsonResponse(
      {
        success: false,
        message: "Davet bilgileri eksik.",
      },
      400,
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return jsonResponse(
      {
        success: false,
        message:
          "Yalnızca JPEG, PNG, WEBP, HEIC ve HEIF görseller yüklenebilir.",
      },
      400,
    );
  }

  if (!Number.isInteger(fileSize) || fileSize <= 0) {
    return jsonResponse(
      {
        success: false,
        message: "Fotoğraf boyutu geçersiz.",
      },
      400,
    );
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return jsonResponse(
      {
        success: false,
        code: "PHOTO_TOO_LARGE",
        message: "Fotoğraf boyutu en fazla 3 MB olabilir.",
      },
      413,
    );
  }

  if (!(await hasValidGuestUploadAccess(invitationId, uploadCode))) {
    return jsonResponse(
      {
        success: false,
        message:
          "Davet bulunamadı, yükleme kodu geçersiz veya fotoğraf yükleme kapalı.",
      },
      403,
    );
  }

  const extension = getExtension(contentType);

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const key = `guest-photos/${invitationId}/${uploadCode}/${fileName}`;

  const r2 = getR2Client();
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");

  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    }),
    {
      expiresIn: UPLOAD_URL_EXPIRES_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );

  return jsonResponse({
    success: true,
    uploadUrl,
    key,
    contentType,
    fileSize,
    expiresIn: UPLOAD_URL_EXPIRES_SECONDS,
  });
}

async function confirmUpload(body: GuestPhotoUploadBody) {
  const invitationId = (body.invitationId ?? "").trim();
  const uploadCode = normalizeUploadCode(body.uploadCode ?? "");
  const key = (body.key ?? "").trim();

  if (!invitationId || !uploadCode || !key) {
    return jsonResponse(
      {
        success: false,
        message: "Yükleme doğrulama bilgileri eksik.",
      },
      400,
    );
  }

  if (!isExpectedGuestPhotoKey(key, invitationId, uploadCode)) {
    return jsonResponse(
      {
        success: false,
        message: "Fotoğraf yolu geçersiz.",
      },
      403,
    );
  }

  if (!(await hasValidGuestUploadAccess(invitationId, uploadCode))) {
    return jsonResponse(
      {
        success: false,
        message:
          "Davet bulunamadı, yükleme kodu geçersiz veya fotoğraf yükleme kapalı.",
      },
      403,
    );
  }

  const r2 = getR2Client();
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");

  let head;

  try {
    head = await r2.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  } catch {
    return jsonResponse(
      {
        success: false,
        code: "PHOTO_NOT_FOUND",
        message: "Yüklenen fotoğraf R2 üzerinde bulunamadı.",
      },
      404,
    );
  }

  const actualSize = Number(head.ContentLength ?? 0);

  const actualContentType = normalizeContentType(head.ContentType ?? "");

  if (
    !Number.isInteger(actualSize) ||
    actualSize <= 0 ||
    actualSize > MAX_FILE_SIZE_BYTES ||
    !ALLOWED_IMAGE_TYPES.has(actualContentType)
  ) {
    try {
      await deleteR2Object(key);
    } catch (deleteError) {
      console.error("Geçersiz guest photo silinemedi:", deleteError);
    }

    return jsonResponse(
      {
        success: false,
        code:
          actualSize > MAX_FILE_SIZE_BYTES
            ? "PHOTO_TOO_LARGE"
            : "INVALID_IMAGE",
        message:
          actualSize > MAX_FILE_SIZE_BYTES
            ? "Fotoğraf boyutu en fazla 3 MB olabilir."
            : "Yüklenen dosya geçerli bir görsel değil.",
      },
      actualSize > MAX_FILE_SIZE_BYTES ? 413 : 400,
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: existingPhoto, error: existingError } = await supabase
    .from("invitation_guest_photos")
    .select("*")
    .eq("storage_path", key)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingPhoto) {
    return jsonResponse({
      success: true,
      key,
      photo: existingPhoto,
    });
  }

  const { data: createdPhoto, error: recordError } = await supabase.rpc(
    "upload_guest_photo_record",
    {
      target_invitation_id: invitationId,
      target_upload_code: uploadCode,
      target_storage_path: key,
    },
  );

  if (recordError) {
    try {
      await deleteR2Object(key);
    } catch (deleteError) {
      console.error(
        "DB kayıt hatası sonrası R2 rollback başarısız:",
        deleteError,
      );
    }

    if (recordError.message.includes("GUEST_PHOTO_LIMIT_REACHED")) {
      return jsonResponse(
        {
          success: false,
          code: "GUEST_PHOTO_LIMIT_REACHED",
          message:
            "Fotoğraf yükleme limiti doldu. Bu hesap için daha fazla fotoğraf yüklenemez.",
        },
        409,
      );
    }

    throw recordError;
  }

  return jsonResponse({
    success: true,
    key,
    photo: createdPhoto,
  });
}

async function finalizeUpload(body: GuestPhotoUploadBody) {
  const invitationId = (body.invitationId ?? "").trim();
  const uploadCode = normalizeUploadCode(body.uploadCode ?? "");

  const photoIds = Array.isArray(body.photoIds)
    ? [...new Set(body.photoIds.map((id) => String(id).trim()).filter(Boolean))]
    : [];

  if (!invitationId || !uploadCode || photoIds.length === 0) {
    return jsonResponse(
      {
        success: false,
        message: "Bildirim doğrulama bilgileri eksik.",
      },
      400,
    );
  }

  if (photoIds.length > 20) {
    return jsonResponse(
      {
        success: false,
        message: "Tek yüklemede en fazla 20 fotoğraf bildirilebilir.",
      },
      400,
    );
  }

  if (!(await hasValidGuestUploadAccess(invitationId, uploadCode))) {
    return jsonResponse(
      {
        success: false,
        message:
          "Davet bulunamadı, yükleme kodu geçersiz veya fotoğraf yükleme kapalı.",
      },
      403,
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: photos, error: photosError } = await supabase
    .from("invitation_guest_photos")
    .select("id, invitation_id, upload_code, created_at")
    .in("id", photoIds)
    .eq("invitation_id", invitationId)
    .eq("upload_code", uploadCode);

  if (photosError) {
    throw photosError;
  }

  if (!photos || photos.length !== photoIds.length) {
    return jsonResponse(
      {
        success: false,
        message: "Bildirim için gönderilen fotoğraflar doğrulanamadı.",
      },
      400,
    );
  }

  const orderedPhotos = [...photos].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const firstPhotoId = orderedPhotos[0]?.id ?? null;

  if (!firstPhotoId) {
    return jsonResponse(
      {
        success: false,
        message: "Bildirim için fotoğraf kaydı bulunamadı.",
      },
      400,
    );
  }

  const { data: notificationId, error: notificationError } = await supabase.rpc(
    "create_guest_photo_upload_notification",
    {
      target_invitation_id: invitationId,
      target_upload_code: uploadCode,
      target_photo_count: photoIds.length,
      target_first_photo_id: firstPhotoId,
    },
  );

  if (notificationError) {
    throw notificationError;
  }

  return jsonResponse({
    success: true,
    notificationId,
    photoCount: photoIds.length,
  });
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

    const body = (await req.json()) as GuestPhotoUploadBody;

    if (body.action === "create-upload") {
      return await createUpload(body);
    }

    if (body.action === "confirm-upload") {
      return await confirmUpload(body);
    }

    if (body.action === "finalize-upload") {
      return await finalizeUpload(body);
    }

    return jsonResponse(
      {
        success: false,
        message: "Geçersiz action değeri.",
      },
      400,
    );
  } catch (error) {
    console.error("Guest photo upload error:", error);

    return jsonResponse(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fotoğraf yükleme işlemi sırasında hata oluştu.",
      },
      500,
    );
  }
});
