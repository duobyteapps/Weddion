import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationQrShareCard } from "@/components/invitations/create/InvitationQrShareCard";
import { InvitationShareNoteCard } from "@/components/invitations/create/InvitationShareNoteCard";
import { InvitationShareReadyCard } from "@/components/invitations/create/InvitationShareReadyCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationFormData } from "@/types/invitation";
import { getCapturedInvitationImageUri } from "@/utils/invitationCaptureStore";

type ShareParams = {
  templateId: string;
  invitationId?: string;
  shareSlug?: string;
  invitationImageUrl?: string;
  editableImageUrl?: string;

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
};

function getCacheBustedImageUrl(imageUrl?: string | null, version?: string) {
  if (!imageUrl) {
    return null;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${separator}v=${version ?? Date.now()}`;
}

function createInvitationSlug(brideName: string, groomName: string) {
  return `${brideName}-${groomName}`
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanOptionalParam(value?: string) {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value;
}

export default function InvitationFlowShareScreen() {
  const params = useLocalSearchParams<ShareParams>();

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const formData: InvitationFormData = useMemo(
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

  const fallbackPreviewImageUrl = useMemo(() => {
    return getCacheBustedImageUrl(
      template?.editableImageUrl ?? template?.imageUrl,
      template?.id,
    );
  }, [template]);

  const capturedInvitationImageUri = useMemo(() => {
    return getCapturedInvitationImageUri();
  }, []);

  const backendInvitationImageUrl = useMemo(() => {
    return cleanOptionalParam(params.invitationImageUrl);
  }, [params.invitationImageUrl]);

  const finalInvitationImageUri = useMemo(() => {
    return (
      capturedInvitationImageUri ||
      backendInvitationImageUrl ||
      fallbackPreviewImageUrl
    );
  }, [
    capturedInvitationImageUri,
    backendInvitationImageUrl,
    fallbackPreviewImageUrl,
  ]);

  const fallbackSlug = useMemo(() => {
    return createInvitationSlug(formData.brideName, formData.groomName);
  }, [formData.brideName, formData.groomName]);

  const qrValue = useMemo(() => {
    const invitationId = params.invitationId ?? params.templateId;
    const slug = params.shareSlug ?? fallbackSlug;

    return `weddion://gallery-upload?invitationId=${invitationId}&slug=${slug}`;
  }, [params.invitationId, params.templateId, params.shareSlug, fallbackSlug]);

  useEffect(() => {
    fetchTemplate();
  }, [params.templateId]);

  async function fetchTemplate() {
    if (!params.templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getInvitationTemplateById(params.templateId);
      setTemplate(data);
    } catch {
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function getRouteParams() {
    return {
      templateId: params.templateId,
      invitationId: params.invitationId ?? "",
      shareSlug: params.shareSlug ?? "",
      invitationImageUrl: params.invitationImageUrl ?? "",
      editableImageUrl:
        params.editableImageUrl ??
        template?.editableImageUrl ??
        template?.imageUrl ??
        "",

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
    };
  }

  function handleBackPress() {
    router.push({
      pathname: "/invitation-flow/[templateId]/preview",
      params: getRouteParams(),
    });
  }

  function handleDownloadInstagramImage() {
    Alert.alert(
      "Görsel hazır",
      "Görsel indirme işlemi şu anda kapalı. Davetiye önizlemesi paylaşım ekranında gösteriliyor.",
    );
  }

  function handleCopyQrLink() {
    Alert.alert(
      "QR bağlantısı",
      `Fotoğraf yükleme bağlantısı hazır.\n\n${qrValue}`,
    );
  }

  function handleDownloadQr() {
    Alert.alert(
      "QR kod hazır",
      "Expo Go içinde QR indirme işlemi kapalıdır. Development build ile aktif edilebilir.",
    );
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A875D1" />
          <AppText className="mt-3">Paylaşım ekranı hazırlanıyor...</AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <AppText variant="subtitle" className="text-center text-textDark">
            Davetiye bulunamadı.
          </AppText>

          <AppText className="mt-2 text-center">
            Seçilen davetiye kaldırılmış veya pasif durumda olabilir.
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Paylaş"
          description="Davetiyenizi Instagram için hazırlayın."
          backTo={{
            pathname: "/my-invitations",
            params: getRouteParams(),
          }}
        />

        <InvitationEditSteps activeStep={3} />

        <InvitationShareReadyCard
          imageUrl={finalInvitationImageUri}
          onDownloadImagePress={handleDownloadInstagramImage}
        />

        <InvitationQrShareCard
          qrValue={qrValue}
          onCopyLinkPress={handleCopyQrLink}
          onDownloadQrPress={handleDownloadQr}
        />

        <InvitationShareNoteCard />
      </ScrollView>
    </ScreenContainer>
  );
}
