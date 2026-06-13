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
import { ActivityIndicator, ScrollView } from "react-native";

type EditParams = {
  templateId?: string | string[];
  invitationId?: string | string[];
  shareSlug?: string | string[];
  invitationImageUrl?: string | string[];
  editableImageUrl?: string | string[];

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
};

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getCacheBustedImageUrl(imageUrl?: string | null, version?: string) {
  if (!imageUrl) {
    return null;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";

  return `${imageUrl}${separator}v=${version ?? Date.now()}`;
}

function createInitialFormData(params: EditParams): InvitationFormData {
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
      getParamValue(params.description) ?? defaultInvitationContent.description,
    venueName:
      getParamValue(params.venueName) ?? defaultInvitationContent.venueName,
    venueLocation:
      getParamValue(params.venueLocation) ??
      defaultInvitationContent.venueLocation,
  };
}

export default function InvitationFlowEditScreen() {
  const appRouter = useAppNavigation();
  const params = useLocalSearchParams<EditParams>();

  const templateId = useMemo(() => {
    return getParamValue(params.templateId);
  }, [params.templateId]);

  const invitationId = useMemo(() => {
    return getParamValue(params.invitationId);
  }, [params.invitationId]);

  const shareSlug = useMemo(() => {
    return getParamValue(params.shareSlug);
  }, [params.shareSlug]);

  const invitationImageUrl = useMemo(() => {
    return getParamValue(params.invitationImageUrl);
  }, [params.invitationImageUrl]);

  const editableImageUrl = useMemo(() => {
    return getParamValue(params.editableImageUrl);
  }, [params.editableImageUrl]);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<InvitationFormData>(() =>
    createInitialFormData(params),
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
      editableImageUrl || template.editableImageUrl || template.imageUrl;

    appRouter.push({
      pathname: "/(tabs)/invitation-flow/[templateId]/preview",
      params: {
        templateId: template.id,
        invitationId: invitationId ?? "",
        shareSlug: shareSlug ?? "",
        invitationImageUrl: invitationImageUrl ?? "",
        editableImageUrl: selectedEditableImageUrl ?? "",

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
    editableImageUrl || template.editableImageUrl || template.imageUrl;

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

        <InvitationPreviewCard
          imageUrl={editablePreviewImageUrl}
          formData={formData}
        />

        <InvitationEditFormSection
          formData={formData}
          onChangeField={handleChangeField}
          onSave={handleSave}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
