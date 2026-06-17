// src/app/(tabs)/support.tsx

import { IllustratedHeroCard } from "@/components/common/IllustratedHeroCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SupportContactFooter } from "@/components/support/SupportContactFooter";
import { SupportFAQ } from "@/components/support/SupportFAQ";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function support() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Yardım ve Destek"
          description="Sorularınıza cevap bulabilir veya bizimle iletişime geçebilirsiniz."
          backTo="/(tabs)/profile"
        />

        <IllustratedHeroCard
          title={"Yardıma ihtiyacınız\nolduğunda buradayız"}
          description="Ekiplerimiz en kısa sürede size yardımcı olacaktır."
          image={require("@/assets/images/illustration/support-hero.png")}
        />

        <SupportFAQ />

        <SupportContactFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
