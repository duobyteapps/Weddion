// src/app/(tabs)/support.tsx

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SupportContactFooter } from "@/components/support/SupportContactFooter";
import { SupportFAQ } from "@/components/support/SupportFAQ";
import { SupportHero } from "@/components/support/SupportHero";
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
        />
        <SupportHero />
        <SupportFAQ />
        <SupportContactFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
