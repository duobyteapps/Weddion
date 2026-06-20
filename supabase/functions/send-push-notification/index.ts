// supabase/functions/send-push-notification/index.ts

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  const payload = await req.json();

  const notification = payload.record;

  const userId = notification.user_id;
  const title = notification.title ?? "Yeni fotoğraf yüklendi";
  const body = notification.body ?? "Davetine yeni fotoğraf eklendi.";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const tokenResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_push_tokens?user_id=eq.${userId}&is_active=eq.true&select=expo_push_token`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const tokens = await tokenResponse.json();

  if (!tokens.length) {
    return new Response(JSON.stringify({ sent: 0, reason: "No push token" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = tokens.map((item: { expo_push_token: string }) => ({
    to: item.expo_push_token,
    sound: "default",
    title,
    body,
    data: {
      notificationId: notification.id,
      type: notification.type,
      invitationId: notification.related_invitation_id,
    },
  }));

  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const result = await expoResponse.json();

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
