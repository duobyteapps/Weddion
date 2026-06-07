import { AppHeader } from "@/components/common/AppHeader";
import { PremiumCard } from "@/components/profile/PremiumCard";
import { ProfileEventCard } from "@/components/profile/ProfileEventCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileMenuSection } from "@/components/profile/ProfileMenuSection";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { accountMenuItems, otherMenuItems } from "@/constants/profileMenuItems";
import { ScrollView } from "react-native";

export default function ProfileScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <AppHeader />

        <ProfileHero />

        <ProfileMenuSection title="Hesabım" items={accountMenuItems} />

        <ProfileEventCard />

        <ProfileMenuSection title="Diğer" items={otherMenuItems} />

        <PremiumCard />
      </ScrollView>
    </ScreenContainer>
  );
}
