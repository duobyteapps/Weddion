import { supabase } from "@/lib/supabase";

export type NotificationSettings = {
  id: string;
  user_id: string;
  all_notifications: boolean;
  app_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateNotificationSettingsPayload = {
  all_notifications: boolean;
  app_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  system_notifications: boolean;
};

const DEFAULT_NOTIFICATION_SETTINGS: UpdateNotificationSettingsPayload = {
  all_notifications: true,
  app_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  system_notifications: true,
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Oturum bulunamadı.");
  }

  return user.id;
}

export async function getCurrentUserNotificationSettings() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data as NotificationSettings;
  }

  const now = new Date().toISOString();

  const { data: createdSettings, error: createError } = await supabase
    .from("notification_settings")
    .insert({
      user_id: userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return createdSettings as NotificationSettings;
}

export async function updateCurrentUserNotificationSettings(
  payload: UpdateNotificationSettingsPayload,
) {
  const userId = await getCurrentUserId();

  const now = new Date().toISOString();

  const { error } = await supabase.from("notification_settings").upsert(
    {
      user_id: userId,
      all_notifications: payload.all_notifications,
      app_notifications: payload.app_notifications,
      email_notifications: payload.email_notifications,
      sms_notifications: payload.sms_notifications,
      system_notifications: payload.system_notifications,
      updated_at: now,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
