// src/components/profile/PremiumCard.tsx
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";

export function PremiumCard() {
  return (
    <AppCard noMargin noPadding className="mb-6 py-4">
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Ionicons name="diamond-outline" size={20} color={Colors.white} />
        </View>

        <View className="flex-1">
          <AppText variant="captionStrong" className="mb-1">
            Premium’a Geç
          </AppText>

          <AppText variant="caption" className="!text-[10px]">
            Daha fazla özellikle etkinliğini bir üst seviyeye taşı!
          </AppText>
        </View>

        <AppButton
          title="Keşfet"
          className="h-9 rounded-xl px-4 z-10"
          textClassName="text-[11px]"
        />
      </View>

      <Image
        source={require("@/assets/images/backgrounds/floral-corner.png")}
        className="absolute -right-5 h-24 w-24"
        resizeMode="contain"
      />
    </AppCard>
  );
}
