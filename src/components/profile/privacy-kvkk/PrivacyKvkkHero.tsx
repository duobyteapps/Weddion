import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Image, View } from "react-native";

export function PrivacyKvkkHero() {
  return (
    <AppCard className="relative overflow-hidden">
      <View className="z-10 w-[55%]">
        <AppText variant="serifTitle" className="mb-3">
          Güvenlik ve{"\n"}Veri Gizliliği
        </AppText>

        <AppText variant="body">
          Verilerinizin güvenliğini sağlamak ve gizliliğinizi korumak için en
          yüksek standartları uyguluyoruz.
        </AppText>
      </View>

      <Image
        source={require("@/assets/images/backgrounds/privacy-hero-illustration.png")}
        className="absolute right-[-16px] top-[18px] h-[150px] w-[165px]"
        resizeMode="contain"
      />
    </AppCard>
  );
}
