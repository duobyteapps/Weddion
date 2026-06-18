import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
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
      className="mb-3 rounded-3xl bg-white px-4 py-4 shadow-sm"
      style={{
        borderWidth: 1,
        borderColor: notification.is_read
          ? Colors.borderSoft
          : Colors.primaryLight,
      }}
    >
      <View className="flex-row items-start">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft">
          <Ionicons name={iconName} size={22} color={Colors.primary} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <AppText
              variant="subtitle"
              className="flex-1 pr-3 text-[15px] text-textDark"
            >
              {notification.title}
            </AppText>

            {!notification.is_read && (
              <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </View>

          <AppText className="mt-1 text-[13px] leading-5 text-textMuted">
            {notification.message}
          </AppText>

          <AppText className="mt-2 text-[12px] text-textLight">
            {formatNotificationDate(notification.created_at)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
