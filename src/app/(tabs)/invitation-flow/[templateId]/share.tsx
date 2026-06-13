import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";

export default function InvitationFlowShareScreen() {
  const params = useLocalSearchParams<{
    templateId: string;
    brideName?: string;
    groomName?: string;
  }>();

  const brideName = params.brideName ?? defaultInvitationContent.brideName;
  const groomName = params.groomName ?? defaultInvitationContent.groomName;

  function handleShare() {
    console.log("Paylaşılacak davetiye:", params.templateId);
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <InvitationEditSteps activeStep={3} />

      <View className="mt-8">
        <AppCard>
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="checkmark" size={34} color="#8B5CF6" />
            </View>

            <AppText
              variant="serifTitle"
              className="mt-5 text-center text-textDark"
            >
              Davetiyen hazır
            </AppText>

            <AppText
              variant="body"
              className="mt-3 text-center leading-6 text-textMuted"
            >
              {brideName} & {groomName} davetiyesini bağlantı olarak
              paylaşabilir veya görsel olarak kaydedebilirsiniz.
            </AppText>

            <View className="mt-6 w-full">
              <AppButton title="Davetiyeyi Paylaş" onPress={handleShare} />
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
