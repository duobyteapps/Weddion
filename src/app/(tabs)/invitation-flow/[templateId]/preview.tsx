import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationFormData } from "@/types/invitation";

export default function InvitationFlowPreviewScreen() {
  const params = useLocalSearchParams<{
    templateId: string;
    brideName?: string;
    groomName?: string;
    brideParents?: string;
    groomParents?: string;
    brideSurname?: string;
    groomSurname?: string;
    date?: string;
    time?: string;
    description?: string;
    venueName?: string;
    venueLocation?: string;
  }>();

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const formData = useMemo<InvitationFormData>(
    () => ({
      brideName: params.brideName ?? defaultInvitationContent.brideName,
      groomName: params.groomName ?? defaultInvitationContent.groomName,
      brideParents:
        params.brideParents ?? defaultInvitationContent.brideParents,
      groomParents:
        params.groomParents ?? defaultInvitationContent.groomParents,
      brideSurname:
        params.brideSurname ?? defaultInvitationContent.brideSurname,
      groomSurname:
        params.groomSurname ?? defaultInvitationContent.groomSurname,
      date: params.date ?? defaultInvitationContent.date,
      time: params.time ?? defaultInvitationContent.time,
      description: params.description ?? defaultInvitationContent.description,
      venueName: params.venueName ?? defaultInvitationContent.venueName,
      venueLocation:
        params.venueLocation ?? defaultInvitationContent.venueLocation,
    }),
    [params],
  );

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
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function handleShareStep() {
    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: {
        templateId: params.templateId,
        brideName: formData.brideName,
        groomName: formData.groomName,
        brideParents: formData.brideParents,
        groomParents: formData.groomParents,
        brideSurname: formData.brideSurname,
        groomSurname: formData.groomSurname,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        venueName: formData.venueName,
        venueLocation: formData.venueLocation,
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <AppText variant="body" className="mt-3 text-textMuted">
          Önizleme hazırlanıyor...
        </AppText>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background px-6">
        <AppText variant="subtitle" className="text-center text-textDark">
          Davetiye bulunamadı.
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <InvitationEditSteps activeStep={2} />

        <View className="mt-6">
          <InvitationPreviewCard
            imageUrl={template.editableImageUrl}
            formData={formData}
          />
        </View>

        <View className="mt-6">
          <AppButton title="Paylaşma Adımına Geç" onPress={handleShareStep} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
