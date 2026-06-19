import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";

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
  all_notifications: false,
  app_notifications: true,
  email_notifications: false,
  sms_notifications: false,
  system_notifications: false,
};

export async function getCurrentUserNotificationSettings(): Promise<NotificationSettings> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
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
      user_id: user.id,
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
): Promise<void> {
  const user = await getAuthenticatedUser();
  const now = new Date().toISOString();

  const { error } = await supabase.from("notification_settings").upsert(
    {
      user_id: user.id,
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

export async function updateCurrentUserSystemNotificationStatus(
  systemNotifications: boolean,
): Promise<void> {
  const user = await getAuthenticatedUser();
  const now = new Date().toISOString();

  const { data: currentSettings, error: readError } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const nextSettings = {
    user_id: user.id,
    all_notifications: false,
    app_notifications: currentSettings?.app_notifications ?? true,
    email_notifications: currentSettings?.email_notifications ?? false,
    sms_notifications: currentSettings?.sms_notifications ?? false,
    system_notifications: systemNotifications,
    updated_at: now,
  };

  const { error } = await supabase
    .from("notification_settings")
    .upsert(nextSettings, {
      onConflict: "user_id",
    });

  if (error) {
    throw new Error(error.message);
  }
}
