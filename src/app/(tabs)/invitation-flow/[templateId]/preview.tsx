import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationFormData } from "@/types/invitation";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function InvitationFlowPreviewScreen() {
  const appRouter = useAppNavigation();

  const params = useLocalSearchParams<{
    templateId?: string | string[];
    brideName?: string | string[];
    groomName?: string | string[];
    brideParents?: string | string[];
    groomParents?: string | string[];
    brideSurname?: string | string[];
    groomSurname?: string | string[];
    date?: string | string[];
    time?: string | string[];
    description?: string | string[];
    venueName?: string | string[];
    venueLocation?: string | string[];
    editableImageUrl?: string | string[];
  }>();

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const templateId = useMemo(() => {
    return getParamValue(params.templateId);
  }, [params.templateId]);

  const editableImageUrl = useMemo(() => {
    return getParamValue(params.editableImageUrl);
  }, [params.editableImageUrl]);

  const formData = useMemo<InvitationFormData>(() => {
    return {
      brideName:
        getParamValue(params.brideName) ?? defaultInvitationContent.brideName,
      groomName:
        getParamValue(params.groomName) ?? defaultInvitationContent.groomName,
      brideParents:
        getParamValue(params.brideParents) ??
        defaultInvitationContent.brideParents,
      groomParents:
        getParamValue(params.groomParents) ??
        defaultInvitationContent.groomParents,
      brideSurname:
        getParamValue(params.brideSurname) ??
        defaultInvitationContent.brideSurname,
      groomSurname:
        getParamValue(params.groomSurname) ??
        defaultInvitationContent.groomSurname,
      date: getParamValue(params.date) ?? defaultInvitationContent.date,
      time: getParamValue(params.time) ?? defaultInvitationContent.time,
      description:
        getParamValue(params.description) ??
        defaultInvitationContent.description,
      venueName:
        getParamValue(params.venueName) ?? defaultInvitationContent.venueName,
      venueLocation:
        getParamValue(params.venueLocation) ??
        defaultInvitationContent.venueLocation,
    };
  }, [
    params.brideName,
    params.groomName,
    params.brideParents,
    params.groomParents,
    params.brideSurname,
    params.groomSurname,
    params.date,
    params.time,
    params.description,
    params.venueName,
    params.venueLocation,
  ]);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  async function fetchTemplate() {
    if (!templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getInvitationTemplateById(templateId);
      setTemplate(data);
    } catch (error) {
      console.log("Davetiye önizleme verisi alınamadı:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function handleShareStep() {
    if (!templateId) {
      return;
    }

    appRouter.push({
      pathname: "/(tabs)/invitation-flow/[templateId]/share",
      params: {
        templateId,
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
        editableImageUrl:
          editableImageUrl ||
          template?.editableImageUrl ||
          template?.imageUrl ||
          "",
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

  const previewImageUrl =
    editableImageUrl || template.editableImageUrl || template.imageUrl;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <InvitationEditSteps activeStep={2} />

        <View className="mt-6">
          <InvitationPreviewCard
            imageUrl={previewImageUrl}
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
