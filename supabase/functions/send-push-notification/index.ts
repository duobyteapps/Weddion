const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type AppNotificationRecord = {
  id: string;
  user_id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  body?: string | null;
  related_invitation_id?: string | null;
  related_guest_photo_id?: string | null;
  created_at?: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: AppNotificationRecord;
  old_record: AppNotificationRecord | null;
};

Deno.serve(async (req) => {
  try {
    console.log("send-push-notification started");

    if (req.method !== "POST") {
      console.log("Invalid method:", req.method);

      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as WebhookPayload;

    console.log("Webhook payload:", JSON.stringify(payload));

    const notification = payload.record;

    if (!notification?.user_id) {
      console.log("Missing notification user_id");

      return new Response(
        JSON.stringify({
          error: "Notification user_id bulunamadı.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.log("Missing env:", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
      });

      return new Response(
        JSON.stringify({
          error: "Supabase environment değişkenleri eksik.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Notification user_id:", notification.user_id);

    const tokenResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_push_tokens?user_id=eq.${notification.user_id}&is_active=eq.true&select=expo_push_token,device_type`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();

      console.log("Token fetch error:", errorText);

      return new Response(
        JSON.stringify({
          error: "Push tokenları alınamadı.",
          details: errorText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const tokens = (await tokenResponse.json()) as {
      expo_push_token: string;
      device_type: string | null;
    }[];

    console.log("Active token count:", tokens.length);
    console.log("Tokens:", JSON.stringify(tokens));

    if (!tokens.length) {
      return new Response(
        JSON.stringify({
          sent: 0,
          reason: "Kullanıcıya ait aktif push token bulunamadı.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const title = notification.title || "Yeni fotoğraf yüklendi";
    const body =
      notification.message ||
      notification.body ||
      "Davetine yeni bir misafir fotoğrafı eklendi.";

    const messages = tokens.map((item) => ({
      to: item.expo_push_token,
      sound: "default",
      title,
      body,
      data: {
        notificationId: notification.id,
        type: notification.type,
        invitationId: notification.related_invitation_id,
        guestPhotoId: notification.related_guest_photo_id,
      },
    }));

    console.log("Expo messages:", JSON.stringify(messages));

    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    console.log("Expo response status:", expoResponse.status);

    const expoResult = await expoResponse.json();

    console.log("Expo response body:", JSON.stringify(expoResult));

    return new Response(
      JSON.stringify({
        sent: messages.length,
        result: expoResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";

    console.log("Function error:", message);

    return new Response(
      JSON.stringify({
        error: "Push bildirimi gönderilemedi.",
        details: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
