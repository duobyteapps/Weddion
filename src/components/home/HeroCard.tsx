import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function HeroCard() {
  return (
    <AppCard className="relative overflow-hidden px-5 py-5">
      <Image
        source={require("../../../assets/images/lavender-garden.png")}
        className="absolute -right-5 top-2 h-40 w-40 opacity-90"
        resizeMode="contain"
      />

      <View className="w-[68%]">
        <AppText variant="caption" className="text-textMuted">
          Hoş geldin
        </AppText>

        <AppText
          variant="serifTitle"
          className="mt-1 text-[24px] leading-7 text-text"
        >
          Davetiyeni oluşturmaya başla
        </AppText>

        <AppText variant="caption" className="mt-3 leading-5 text-textMuted">
          Özel anlarını sevdiklerinle paylaşmanın en zarif yolu.
        </AppText>
      </View>

      <Pressable className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-primary">
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <AppText variant="caption" className="font-manropeSemiBold text-white">
          Yeni Davetiye Oluştur
        </AppText>
      </Pressable>
    </AppCard>
  );
}
