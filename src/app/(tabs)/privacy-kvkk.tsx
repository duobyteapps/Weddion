// src/app/(tabs)/privacy-kvkk.tsx

import { IllustratedHeroCard } from "@/components/common/IllustratedHeroCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { PrivacyKvkkContent } from "@/components/privacy/privacy-kvkk/PrivacyKvkkContent";
import { PrivacyKvkkFooter } from "@/components/privacy/privacy-kvkk/PrivacyKvkkFooter";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function PrivacyKvkkScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <ScreenHeader
          title="Gizlilik ve KVKK"
          description="Verileriniz bizim için değerlidir."
          backTo="/(tabs)/profile"
        />

        <IllustratedHeroCard
          title={"Güvenlik ve\nVeri Gizliliği"}
          description="Verilerinizin güvenliğini sağlamak ve gizliliğinizi korumak için en yüksek standartları uyguluyoruz."
          image={require("@/assets/images/illustration/privacy-hero.png")}
        />

        <PrivacyKvkkContent />

        <PrivacyKvkkFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
