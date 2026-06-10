import { Image, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function NotificationHeroCard() {
  return (
    <AppCard>
      <View className="z-10 w-[48%]">
        <AppText variant="serifTitle" className="mb-3">
          Önemli anları{"\n"}kaçırmayın
        </AppText>

        <AppText variant="body">
          Sizin için önemli gelişmeleri zamanında bildirimlerle öğrenin.
        </AppText>
      </View>

      <Image
        source={require("@/assets/images/backgrounds/notification-settings-flower.png")}
        className="absolute right-[-22px] top-[18px] h-[135px] w-[145px]"
        resizeMode="contain"
      />

      <Image
        source={require("@/assets/images/backgrounds/notification-icon.png")}
        className="absolute right-[115px] top-[52px] h-[72px] w-[72px]"
        resizeMode="contain"
      />
    </AppCard>
  );
}
