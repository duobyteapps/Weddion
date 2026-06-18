import { Pressable, View } from "react-native";

import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import type { UserNotification } from "@/types/notification";

type Props = {
  notification: UserNotification;
  onPress?: (notification: UserNotification) => void;
};

function formatNotificationDate(date: string) {
  const notificationDate = new Date(date);
  const now = new Date();

  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Şimdi";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} dk önce`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} sa önce`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  return notificationDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
  });
}

function getNotificationIcon(type: UserNotification["type"]) {
  switch (type) {
    case "guest_photo":
      return "image-outline";
    case "system":
    default:
      return "notifications-outline";
  }
}

export function NotificationItemCard({ notification, onPress }: Props) {
  const iconName = getNotificationIcon(notification.type);

  return (
    <Pressable
      onPress={() => onPress?.(notification)}
      className="mb-3 rounded-xl bg-white px-4 py-4"
    >
      <View className="flex-row items-start">
        <AppIconBox icon={iconName} className="mr-3 h-11 w-11" />

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <AppText variant="serifSubtitle">{notification.title}</AppText>

            {!notification.is_read && (
              <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </View>

          <AppText variant="body">{notification.message}</AppText>

          <AppText variant="caption">
            {formatNotificationDate(notification.created_at)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
