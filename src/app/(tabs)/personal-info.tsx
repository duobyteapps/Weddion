import { AccountPreferencesCard } from "@/components/profile/personal-info/AccountPreferencesCard";
import { PersonalInfoCard } from "@/components/profile/personal-info/PersonalInfoCard";
import { PersonalInfoHeader } from "@/components/profile/personal-info/PersonalInfoHeader";
import { ProfilePhotoSection } from "@/components/profile/personal-info/ProfilePhotoSection";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function PersonalInfoScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <PersonalInfoHeader />

        <ProfilePhotoSection />

        <PersonalInfoCard />

        <AccountPreferencesCard />

        <AppButton
          title="Değişiklikleri Kaydet"
          className="mt-7 h-[56px] rounded-2xl"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
