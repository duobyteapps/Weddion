import { Image, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

const notificationHero = require("@/assets/images/illustration/notification-hero.png");

type Props = {
  unreadCount: number;
};

export function NotificationSummaryCard({ unreadCount }: Props) {
  return (
    <AppCard noPadding className="flex-row items-center gap-5">
      <View className="flex-1">
        <AppText variant="serifTitle" className="!text-[20px] !leading-[23px]">
          Yeni fotoğraflar
        </AppText>

        <AppText variant="caption" className="mt-2">
          {unreadCount > 0
            ? `${unreadCount} okunmamış bildiriminiz var.`
            : "Tüm bildirimleriniz güncel."}
        </AppText>
      </View>

      <Image
        source={notificationHero}
        className="h-36 w-36"
        resizeMode="contain"
      />
    </AppCard>
  );
}
