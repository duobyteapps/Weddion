import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  unreadCount: number;
};

export function NotificationSummaryCard({ unreadCount }: Props) {
  return (
    <View className="mb-5 rounded-3xl bg-primarySoft px-5 py-5">
      <View className="flex-row items-center">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="sparkles-outline" size={23} color={Colors.primary} />
        </View>

        <View className="flex-1">
          <AppText variant="subtitle" className="text-[16px] text-textDark">
            Yeni fotoğraflar
          </AppText>

          <AppText className="mt-1 text-[13px] leading-5 text-textMuted">
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildiriminiz var.`
              : "Tüm bildirimleriniz güncel."}
          </AppText>
        </View>
      </View>
    </View>
  );
}
