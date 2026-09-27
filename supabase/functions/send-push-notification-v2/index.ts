const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type AppNotificationRecord = {
  id: string;
  user_id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  related_invitation_id?: string | null;
  related_guest_photo_id?: string | null;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    id?: string;
  };
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();

  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }

  return difference === 0;
}

function getPushWebhookKey() {
  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (!rawSecretKeys) {
    return null;
  }

  try {
    const secretKeys = JSON.parse(rawSecretKeys) as Record<string, string>;

    return secretKeys.push_webhook ?? null;
  } catch {
    return null;
  }
}

function isAuthorized(req: Request) {
  const providedKey = req.headers.get("apikey") ?? "";

  const expectedKey = getPushWebhookKey();

  return (
    Boolean(expectedKey) &&
    constantTimeEqual(providedKey, expectedKey as string)
  );
}

async function supabaseRestRequest(path: string, serviceRoleKey: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL bulunamadı.");
  }

  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return jsonResponse(
        {
          error: "Method not allowed",
        },
        405,
      );
    }

    if (!isAuthorized(req)) {
      console.warn("Push webhook unauthorized request rejected.");

      return jsonResponse(
        {
          error: "Unauthorized",
        },
        401,
      );
    }

    const payload = (await req.json()) as WebhookPayload;

    const notificationId = payload.record?.id;

    if (
      payload.type !== "INSERT" ||
      payload.schema !== "public" ||
      payload.table !== "app_notifications" ||
      typeof notificationId !== "string" ||
      !notificationId
    ) {
      return jsonResponse(
        {
          error: "Geçersiz webhook payload.",
        },
        400,
      );
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY bulunamadı.");
    }

    const notificationResponse = await supabaseRestRequest(
      `app_notifications?id=eq.${encodeURIComponent(
        notificationId,
      )}&select=id,user_id,type,title,message,related_invitation_id,related_guest_photo_id`,
      serviceRoleKey,
    );

    if (!notificationResponse.ok) {
      throw new Error(
        `Bildirim kaydı sorgulanamadı. Status: ${notificationResponse.status}`,
      );
    }

    const notificationRows =
      (await notificationResponse.json()) as AppNotificationRecord[];

    const notification = notificationRows[0];

    if (!notification) {
      return jsonResponse(
        {
          error: "Bildirim kaydı doğrulanamadı.",
        },
        404,
      );
    }

    const tokenResponse = await supabaseRestRequest(
      `user_push_tokens?user_id=eq.${encodeURIComponent(
        notification.user_id,
      )}&is_active=eq.true&select=expo_push_token,device_type`,
      serviceRoleKey,
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Push tokenları sorgulanamadı. Status: ${tokenResponse.status}`,
      );
    }

    const tokens = (await tokenResponse.json()) as Array<{
      expo_push_token: string;
      device_type?: string | null;
    }>;

    console.log("Push notification processing.", {
      notificationId: notification.id,
      recipientCount: tokens.length,
    });

    if (tokens.length === 0) {
      return jsonResponse({
        success: true,
        sent: 0,
        reason: "Aktif push token bulunamadı.",
      });
    }

    const title = notification.title || "Yeni fotoğraf";

    const message =
      notification.message || "Galerine yeni bir fotoğraf yüklendi.";

    const expoMessages = tokens.map((token) => ({
      to: token.expo_push_token,
      sound: "default",
      title,
      body: message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        relatedInvitationId: notification.related_invitation_id,
        relatedGuestPhotoId: notification.related_guest_photo_id,
      },
    }));

    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expoMessages),
    });

    const expoResult = await expoResponse.json().catch(() => null);

    if (!expoResponse.ok) {
      throw new Error(
        `Expo push isteği başarısız. Status: ${expoResponse.status}`,
      );
    }

    console.log("Push notification completed.", {
      notificationId: notification.id,
      recipientCount: tokens.length,
    });

    return jsonResponse({
      success: true,
      sent: tokens.length,
      expo: expoResult,
    });
  } catch (error) {
    console.error(
      "Push notification failed.",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonResponse(
      {
        error: "Push bildirimi gönderilemedi.",
      },
      500,
    );
  }
});
