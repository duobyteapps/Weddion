import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";
import type { UserNotification } from "@/types/notification";

export async function getCurrentUserNotifications(): Promise<
  UserNotification[]
> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("app_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserNotification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getAuthenticatedUser();

  const { count, error } = await supabase
    .from("app_notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("app_notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead() {
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("app_notifications")
    .update({
      is_read: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}
