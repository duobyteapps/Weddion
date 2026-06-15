import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "npm:@aws-sdk/client-s3@3.668.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.668.0";

type R2Action = "upload-url" | "get-url" | "delete";

type R2RequestBody = {
  action?: R2Action;
  key?: string;
  contentType?: string;
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

function validateObjectKey(key: string) {
  const cleanKey = key.trim();

  if (!cleanKey) {
    throw new Error("R2 object key boş olamaz.");
  }

  if (cleanKey.startsWith("/") || cleanKey.includes("..")) {
    throw new Error("R2 object key geçersiz.");
  }

  const allowedPrefixes = ["invitations/", "guest-photos/"];
  const isAllowedPrefix = allowedPrefixes.some((prefix) =>
    cleanKey.startsWith(prefix),
  );

  if (!isAllowedPrefix) {
    throw new Error(
      "R2 object key sadece invitations/ veya guest-photos/ ile başlamalı.",
    );
  }

  return cleanKey;
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

    const bucketName = getRequiredEnv("R2_BUCKET_NAME");
    const body = (await req.json()) as R2RequestBody;

    if (!body.action) {
      return jsonResponse(
        {
          success: false,
          message: "action alanı zorunludur.",
        },
        400,
      );
    }

    if (!body.key) {
      return jsonResponse(
        {
          success: false,
          message: "key alanı zorunludur.",
        },
        400,
      );
    }

    const key = validateObjectKey(body.key);
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

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(r2, command, {
        expiresIn: 60 * 5,
      });

      return jsonResponse({
        success: true,
        uploadUrl,
        key,
      });
    }

    if (body.action === "get-url") {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(r2, command, {
        expiresIn: 60 * 60,
      });

      return jsonResponse({
        success: true,
        signedUrl,
        key,
      });
    }

    if (body.action === "delete") {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await r2.send(command);

      return jsonResponse({
        success: true,
        key,
      });
    }

    return jsonResponse(
      {
        success: false,
        message: "Geçersiz action değeri.",
      },
      400,
    );
  } catch (error) {
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
