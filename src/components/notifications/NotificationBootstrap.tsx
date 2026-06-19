import { useAuth } from "@/context/AuthContext";
import {
    getCurrentUserNotificationSettings,
    updateCurrentUserSystemNotificationStatus,
} from "@/services/notificationSettingsService";
import { registerCurrentDeviceForPushNotifications } from "@/services/pushNotificationService";
import { useEffect, useRef } from "react";

export function NotificationBootstrap() {
  const { isAuthenticated, loading } = useAuth();
  const initializedUserRef = useRef<string | null>(null);

  useEffect(() => {
    async function initializeNotifications() {
      if (loading || !isAuthenticated) return;

      try {
        const settings = await getCurrentUserNotificationSettings();

        if (initializedUserRef.current === settings.user_id) {
          return;
        }

        initializedUserRef.current = settings.user_id;

        if (settings.system_notifications) {
          return;
        }

        const permission = await registerCurrentDeviceForPushNotifications();

        await updateCurrentUserSystemNotificationStatus(permission.granted);
      } catch (error) {
        console.log("İlk bildirim izni başlatılamadı:", error);
      }
    }

    initializeNotifications();
  }, [isAuthenticated, loading]);

  return null;
}
