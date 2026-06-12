import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function InvitationFlowShareScreen() {
  const params = useLocalSearchParams<{
    templateId: string;
    names?: string;
  }>();

  function handleShare() {
    console.log("Paylaşılacak davetiye:", params.templateId);
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="flex-1 pb-32">
        <InvitationEditSteps activeStep={3} />

        <View className="flex-1 items-center justify-center">
          <AppCard className="w-full items-center rounded-[28px] bg-surface p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primarySoft">
              <Ionicons name="share-social-outline" size={32} color="#7C3AED" />
            </View>

            <AppText
              variant="serifTitle"
              className="mt-5 text-center text-textDark"
            >
              Davetiyen hazır
            </AppText>

            <AppText variant="body" className="mt-3 text-center text-textMuted">
              {params.names ?? "Davetiyenizi"} bağlantı olarak paylaşabilir veya
              görsel olarak kaydedebilirsiniz.
            </AppText>

            <View className="mt-7 w-full">
              <AppButton title="Paylaş" onPress={handleShare} />
            </View>
          </AppCard>
        </View>
      </View>
    </ScreenContainer>
  );
}
