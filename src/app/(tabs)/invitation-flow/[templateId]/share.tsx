import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationQrShareCard } from "@/components/invitations/create/InvitationQrShareCard";
import { InvitationShareNoteCard } from "@/components/invitations/create/InvitationShareNoteCard";
import { InvitationShareReadyCard } from "@/components/invitations/create/InvitationShareReadyCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationFormData } from "@/types/invitation";

type ShareParams = {
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
  capturedImageUri?: string;
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

  const finalInvitationImageUri = useMemo(() => {
    return params.capturedImageUri || fallbackPreviewImageUrl;
  }, [params.capturedImageUri, fallbackPreviewImageUrl]);

  const invitationSlug = useMemo(() => {
    return createInvitationSlug(formData.brideName, formData.groomName);
  }, [formData.brideName, formData.groomName]);

  const qrValue = useMemo(() => {
    return `weddion://gallery-upload?invitationId=${params.templateId}&slug=${invitationSlug}`;
  }, [params.templateId, invitationSlug]);

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
    } catch (error) {
      console.log("Davetiye paylaşım verisi alınamadı:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function getRouteParams() {
    return {
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
    };
  }

  function handleGoBack() {
    router.push({
      pathname: "/invitation-flow/[templateId]/preview",
      params: getRouteParams(),
    });
  }

  function handleDownloadInstagramImage() {
    console.log("Instagram için davetiye görseli indirilecek:", {
      templateId: params.templateId,
      imageUri: finalInvitationImageUri,
    });
  }

  function handleCopyQrLink() {
    console.log("QR bağlantısı kopyalanacak:", qrValue);
  }

  function handleDownloadQr() {
    console.log("QR kod indirilecek:", qrValue);
  }

  function handleSave() {
    console.log("Davetiye kaydedilecek:", {
      templateId: params.templateId,
      formData,
      imageUri: finalInvitationImageUri,
      qrValue,
    });
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
        />

        <View className="mt-4">
          <InvitationEditSteps activeStep={3} />
        </View>

        <View className="mt-6">
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

          <AppButton
            title="Kaydet"
            variant="primary"
            onPress={handleSave}
            className="mt-6 h-14 rounded-full"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
