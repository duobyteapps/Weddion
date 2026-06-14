import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationQrShareCard } from "@/components/invitations/create/InvitationQrShareCard";
import { InvitationShareNoteCard } from "@/components/invitations/create/InvitationShareNoteCard";
import { InvitationShareReadyCard } from "@/components/invitations/create/InvitationShareReadyCard";
import { useAppAlert } from "@/components/ui/AppAlert";
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

  guestUploadCode?: string;
  guestUploadSlug?: string;
  guestUploadQrValue?: string;

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
  const { showAlert } = useAppAlert();

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

  const guestUploadCode = useMemo(() => {
    return cleanOptionalParam(params.guestUploadCode) ?? null;
  }, [params.guestUploadCode]);

  const guestUploadSlug = useMemo(() => {
    return cleanOptionalParam(params.guestUploadSlug) ?? null;
  }, [params.guestUploadSlug]);

  const guestUploadQrValue = useMemo(() => {
    return cleanOptionalParam(params.guestUploadQrValue) ?? null;
  }, [params.guestUploadQrValue]);

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
    if (guestUploadQrValue) {
      return guestUploadQrValue;
    }

    const slug = guestUploadSlug ?? params.shareSlug ?? fallbackSlug;

    return `weddion://guest-upload/${slug}`;
  }, [guestUploadQrValue, guestUploadSlug, params.shareSlug, fallbackSlug]);

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

      guestUploadCode: guestUploadCode ?? "",
      guestUploadSlug: guestUploadSlug ?? "",
      guestUploadQrValue: guestUploadQrValue ?? "",

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

  function handleDownloadInstagramImage() {
    showAlert({
      type: "info",
      title: "Görsel hazır",
      message:
        "Görsel indirme işlemi şu anda kapalı. Davetiye önizlemesi paylaşım ekranında gösteriliyor.",
      confirmText: "Tamam",
    });
  }

  async function handleCopyCodePress() {
    if (!guestUploadCode) {
      showAlert({
        type: "warning",
        title: "Kod bulunamadı",
        message: "Bu davetiye için fotoğraf yükleme kodu henüz oluşmamış.",
        confirmText: "Tamam",
      });

      return;
    }

    await Clipboard.setStringAsync(guestUploadCode);

    showAlert({
      type: "success",
      title: "Kod kopyalandı",
      message: "Davet kodu panoya kopyalandı.",
      confirmText: "Tamam",
    });
  }

  async function handleCopyLinkPress() {
    await Clipboard.setStringAsync(qrValue);

    showAlert({
      type: "success",
      title: "Bağlantı kopyalandı",
      message: "Fotoğraf yükleme bağlantısı panoya kopyalandı.",
      confirmText: "Tamam",
    });
  }

  function handleDownloadQrPress() {
    showAlert({
      type: "info",
      title: "QR kod hazır",
      message:
        "Expo Go içinde QR indirme işlemi kapalıdır. Development build ile aktif edilebilir.",
      confirmText: "Tamam",
    });
  }

  function handleBackPress() {
    router.push({
      pathname: "/invitation-flow/[templateId]/preview",
      params: getRouteParams(),
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
          guestUploadCode={guestUploadCode}
          onCopyCodePress={handleCopyCodePress}
          onCopyLinkPress={handleCopyLinkPress}
          onDownloadQrPress={handleDownloadQrPress}
        />

        <InvitationShareNoteCard />
      </ScrollView>
    </ScreenContainer>
  );
}
