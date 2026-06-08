// src/components/profile/PremiumCard.tsx
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { AppCard } from "../ui/AppCard";

export function PremiumCard() {
  return (
    <AppCard className="flex-row items-center">
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-primary">
        <Ionicons name="diamond-outline" size={38} color={Colors.white} />
      </View>

      <View className="ml-5 flex-1">
        <AppText variant="subtitle" className="text-[17px] text-textDark">
          Premium’a Geç
        </AppText>

        <AppText className="mt-1 text-[14px] text-textMuted">
          Daha fazla özellikle etkinliğini bir üst seviyeye taşı!
        </AppText>
      </View>

      <Pressable className="rounded-xl bg-primary px-7 py-3">
        <AppText className="font-manropeSemiBold text-white">Keşfet</AppText>
      </Pressable>

      <Image
        source={require("../../../assets/images/backgrounds/floral-corner.png")}
        className="absolute -right-5 -top-5 h-24 w-24 opacity-70"
        resizeMode="contain"
      />
    </AppCard>
  );
}
