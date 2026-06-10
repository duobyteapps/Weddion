import { ScreenHeader } from "@/components/common/ScreenHeader";
import { PrivacyDisclosureContent } from "@/components/privacy/PrivacyDisclosureContent";
import { PrivacyDisclosureFooter } from "@/components/privacy/PrivacyDisclosureFooter";
import { PrivacyDisclosureHero } from "@/components/privacy/PrivacyDisclosureHero";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function PrivacyDisclosureScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader title="KVKK Aydınlatma Metni" />

        <PrivacyDisclosureHero />

        <PrivacyDisclosureContent />

        <PrivacyDisclosureFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
