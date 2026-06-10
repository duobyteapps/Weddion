// src/app/(tabs)/privacy-kvkk.tsx

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { PrivacyKvkkContent } from "@/components/profile/privacy-kvkk/PrivacyKvkkContent";
import { PrivacyKvkkFooter } from "@/components/profile/privacy-kvkk/PrivacyKvkkFooter";
import { PrivacyKvkkHero } from "@/components/profile/privacy-kvkk/PrivacyKvkkHero";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function PrivacyKvkkScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Gizlilik ve KVKK"
          description="Verileriniz bizim için değerlidir."
        />
        <PrivacyKvkkHero />
        <PrivacyKvkkContent />
        <PrivacyKvkkFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
