import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";

export default function InvitationFlowPreviewScreen() {
  const params = useLocalSearchParams<{
    templateId: string;
    names?: string;
    date?: string;
    time?: string;
    description?: string;
    venueName?: string;
    venueLocation?: string;
  }>();

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const names = params.names ?? "Nisa & Onur";
  const date = params.date ?? "22 AĞUSTOS 2026";
  const time = params.time ?? "CUMARTESİ | 19.00";
  const description =
    params.description ??
    "Bu özel günümüzde\nsizleri de aramızda görmekten\nmutluluk duyarız.";
  const venueName = params.venueName ?? "FOUR SEASONS HOTEL";
  const venueLocation = params.venueLocation ?? "Beşiktaş, İstanbul";

  useEffect(() => {
    if (!params.templateId) {
      return;
    }

    fetchTemplate();
  }, [params.templateId]);

  async function fetchTemplate() {
    try {
      setLoading(true);

      const data = await getInvitationTemplateById(params.templateId);
      setTemplate(data);
    } catch (error) {
      console.log("Davetiye önizleme verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleShareStep() {
    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: {
        templateId: params.templateId,
        names,
        date,
        time,
        description,
        venueName,
        venueLocation,
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7C3AED" />

          <AppText variant="caption" className="mt-3 text-textMuted">
            Önizleme hazırlanıyor...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <AppText variant="subtitle" className="text-center text-textDark">
            Davetiye bulunamadı.
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <InvitationEditSteps activeStep={2} />

        <View className="mt-5">
          <InvitationPreviewCard
            template={template}
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
          />
        </View>

        <View className="mt-6">
          <AppButton title="Paylaşmaya Geç" onPress={handleShareStep} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
