import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditFormSection } from "@/components/invitations/create/InvitationEditFormSection";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
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

function getCacheBustedImageUrl(imageUrl?: string | null, version?: string) {
  if (!imageUrl) {
    return null;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";

  return `${imageUrl}${separator}v=${version ?? Date.now()}`;
}

export default function InvitationFlowEditScreen() {
  const appRouter = useAppNavigation();
  const params = useLocalSearchParams<{ templateId?: string | string[] }>();

  const templateId = useMemo(() => {
    if (Array.isArray(params.templateId)) {
      return params.templateId[0];
    }

    return params.templateId;
  }, [params.templateId]);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<InvitationFormData>(
    defaultInvitationContent,
  );

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
      console.log("Davetiye şablonu alınamadı:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function handleChangeField<K extends keyof InvitationFormData>(
    field: K,
    value: InvitationFormData[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSave() {
    if (!template) {
      return;
    }

    const selectedEditableImageUrl =
      template.editableImageUrl || template.imageUrl;

    appRouter.push({
      pathname: "/(tabs)/invitation-flow/[templateId]/preview",
      params: {
        templateId: template.id,
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
        editableImageUrl: selectedEditableImageUrl ?? "",
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <AppText variant="body" className="mt-3 text-textMuted">
          Davetiye yükleniyor...
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

        <AppText variant="body" className="mt-2 text-center text-textMuted">
          Seçilen davetiye kaldırılmış veya pasif durumda olabilir.
        </AppText>
      </ScreenContainer>
    );
  }

  const selectedEditableImageUrl =
    template.editableImageUrl || template.imageUrl;

  const editablePreviewImageUrl = getCacheBustedImageUrl(
    selectedEditableImageUrl,
    template.id,
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Davetiyeni Düzenle"
          description="Bilgileri doldur, davetiyeni önizle."
        />

        <InvitationEditSteps activeStep={1} />

        <View className="mt-6 gap-6">
          <InvitationPreviewCard
            imageUrl={editablePreviewImageUrl}
            formData={formData}
          />

          <InvitationEditFormSection
            formData={formData}
            onChangeField={handleChangeField}
            onSave={handleSave}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
