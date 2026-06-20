import { useEffect, useRef } from "react";

import {
  getCurrentUserNotificationSettings,
  updateCurrentUserSystemNotificationStatus,
} from "@/services/notificationSettingsService";
import { registerCurrentDeviceForPushNotifications } from "@/services/pushNotificationService";

type Props = {
  enabled: boolean;
};

export function NotificationBootstrap({ enabled }: Props) {
  const initializedRef = useRef(false);

  useEffect(() => {
    async function initializeNotifications() {
      if (!enabled || initializedRef.current) {
        return;
      }

      initializedRef.current = true;

      try {
        const settings = await getCurrentUserNotificationSettings();

        if (!settings.system_notifications) {
          return;
        }

        const permission = await registerCurrentDeviceForPushNotifications();

        if (!permission.granted) {
          await updateCurrentUserSystemNotificationStatus(false);
          return;
        }

        await updateCurrentUserSystemNotificationStatus(true);
      } catch (error) {
        initializedRef.current = false;
        console.log("Bildirim izni başlatılamadı:", error);
      }
    }

    initializeNotifications();
  }, [enabled]);

  return null;
}
