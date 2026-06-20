import { Ionicons } from "@expo/vector-icons";
import type { GestureResponderEvent } from "react-native";
import { Pressable, View } from "react-native";

import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import type { UserNotification } from "@/types/notification";

type Props = {
  notification: UserNotification;
  onPress?: (notification: UserNotification) => void;
  onDelete?: (notification: UserNotification) => void;
  deleting?: boolean;
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

export function NotificationItemCard({
  notification,
  onPress,
  onDelete,
  deleting = false,
}: Props) {
  const iconName = getNotificationIcon(notification.type);

  function handleDeletePress(event: GestureResponderEvent) {
    event.stopPropagation();
    onDelete?.(notification);
  }

  return (
    <Pressable
      onPress={() => onPress?.(notification)}
      disabled={deleting}
      className={`mb-3 rounded-xl bg-white px-4 py-4 ${
        deleting ? "opacity-60" : ""
      }`}
    >
      <Pressable
        onPress={handleDeletePress}
        disabled={deleting}
        hitSlop={12}
        className="absolute right-3 top-3 z-10 h-8 w-8 items-center justify-center rounded-full bg-softPink"
      >
        <Ionicons name="close" size={18} color="#8E6A9E" />
      </Pressable>

      <View className="flex-row pr-8">
        <AppIconBox icon={iconName} className="mr-3 mt-1" />

        <View className="flex-1">
          <View className="mb-1 flex-row items-start justify-between gap-2">
            <AppText variant="subtitle" className="flex-1 text-textDark">
              {notification.title}
            </AppText>

            {!notification.is_read && (
              <View className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </View>

          <AppText variant="caption" className="leading-5 text-textSoft">
            {notification.message}
          </AppText>

          <AppText variant="caption" className="mt-2 text-textSoft">
            {formatNotificationDate(notification.created_at)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
