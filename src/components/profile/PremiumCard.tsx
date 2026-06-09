// src/components/profile/PremiumCard.tsx
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";

export function PremiumCard() {
  return (
    <AppCard className="flex-row items-center">
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary">
        <Ionicons name="diamond-outline" size={25} color={Colors.white} />
      </View>

      <View className="ml-3 flex-1">
        <AppText variant="subtitle" className="text-textDark">
          Premium’a Geç
        </AppText>

        <AppText variant="body" className="mt-1">
          Daha fazla özellikle etkinliğini bir üst seviyeye taşı!
        </AppText>
      </View>

      <Image
        source={require("@/assets/images/backgrounds/floral-corner.png")}
        className="absolute -right-5 -top-8 h-24 w-24"
        resizeMode="contain"
      />

      <AppButton title="Keşfet" className="rounded-xl h-11" />
    </AppCard>
  );
}
