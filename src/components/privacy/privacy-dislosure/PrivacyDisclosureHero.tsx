import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Image, View } from "react-native";

export function PrivacyDisclosureHero() {
  return (
    <AppCard className="flex-row items-center gap-5 rounded-[28px] border border-primary/10 bg-primary/5 p-6">
      <Image
        source={require("@/assets/images/illustration/privacy-hero.png")}
        className="h-28 w-28"
        resizeMode="contain"
      />

      <View className="flex-1">
        <AppText variant="captionStrong" className="mb-1 text-[10px]">
          Kişisel Verileriniz Bizim İçin Önemlidir
        </AppText>

        <AppText variant="caption" className="text-[10px]">
          Verilerinizi korumak ve güvenliğinizi sağlamak için gerekli teknik ve
          idari önlemleri titizlikle uyguluyoruz.
        </AppText>
      </View>
    </AppCard>
  );
}
