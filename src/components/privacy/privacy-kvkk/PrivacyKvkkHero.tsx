import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Image, View } from "react-native";

export function PrivacyKvkkHero() {
  return (
    <AppCard className="relative overflow-hidden">
      <View className="z-10 w-[56%]">
        <AppText variant="serifTitle" className="!text-[20px] !leading-[23px]">
          Güvenlik ve{"\n"}Veri Gizliliği
        </AppText>

        <AppText variant="caption" className="mt-2">
          Verilerinizin güvenliğini sağlamak ve gizliliğinizi korumak için en
          yüksek standartları uyguluyoruz.
        </AppText>
      </View>

      <Image
        source={require("@/assets/images/illustration/privacy-hero.png")}
        className="absolute right-[8px] top-[18px] h-[105px] w-[140px]"
        resizeMode="contain"
      />
    </AppCard>
  );
}
