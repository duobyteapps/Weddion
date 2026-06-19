import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationQrDownloadCard } from "@/components/invitations/create/InvitationQrDownloadCard";
import { InvitationQrShareCard } from "@/components/invitations/create/InvitationQrShareCard";
import { InvitationShareNoteCard } from "@/components/invitations/create/InvitationShareNoteCard";
import { InvitationShareReadyCard } from "@/components/invitations/create/InvitationShareReadyCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import { downloadImageToGallery } from "@/services/imageDownloadService";
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
  eventTypeId?: string;
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

  const qrDownloadCardRef = useRef<View>(null);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvitation, setDownloadingInvitation] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const formData: InvitationFormData = useMemo(
    () => ({
      eventTypeId: params.eventTypeId ?? "",
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

  const capturedInvitationImageUri = useMemo(() => {
    return getCapturedInvitationImageUri();
  }, []);

  const backendInvitationImageUrl = useMemo(() => {
    return cleanOptionalParam(params.invitationImageUrl);
  }, [params.invitationImageUrl]);

  const editableImageUrl = useMemo(() => {
    return cleanOptionalParam(params.editableImageUrl);
  }, [params.editableImageUrl]);

  const fallbackPreviewImageUrl = useMemo(() => {
    return (
      editableImageUrl ??
      template?.editableImageUrl ??
      template?.imageUrl ??
      null
    );
  }, [editableImageUrl, template]);

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
    } catch (error) {
      console.log("Davetiye şablonu alınamadı:", error);
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
        editableImageUrl ??
        template?.editableImageUrl ??
        template?.imageUrl ??
        "",
      eventTypeId: formData.eventTypeId,
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

  async function handleDownloadInstagramImage(imageUri?: string | null) {
    const invitationImageUri = imageUri ?? finalInvitationImageUri;

    if (!invitationImageUri) {
      showAlert({
        type: "warning",
        title: "Görsel bulunamadı",
        message: "İndirilecek davetiye görseli hazırlanamadı.",
        confirmText: "Tamam",
      });

      return;
    }

    try {
      setDownloadingInvitation(true);

      console.log(
        "Davetiye indirilecek uri:",
        invitationImageUri.slice(0, 160),
      );

      await downloadImageToGallery({
        imageUri: invitationImageUri,
        fileNamePrefix: `weddion-davetiye-${formData.brideName}-${formData.groomName}`,
      });

      showAlert({
        type: "success",
        title: "Davetiye indirildi",
        message:
          Platform.OS === "ios"
            ? "Davetiye Fotoğraflar uygulamasına kaydedildi."
            : "Davetiye galerinize kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log(
        "Davetiye indirme hatası:",
        error,
        "invitationImageUri:",
        invitationImageUri.slice(0, 160),
      );

      const message =
        error instanceof Error && error.message === "GALLERY_PERMISSION_DENIED"
          ? "Davetiyeyi galeriye kaydedebilmek için fotoğraf ekleme izni vermelisiniz. Ayarlar > Weddion > Fotoğraflar kısmından erişimi açın."
          : error instanceof Error && error.message === "UNSUPPORTED_IMAGE_URI"
            ? "Davetiye görselinin dosya adresi desteklenmiyor. Lütfen davetiyeyi tekrar önizleyip yeniden indirmeyi deneyin."
            : "Davetiye galeriye kaydedilemedi. Fotoğraf iznini kontrol edip tekrar deneyin.";

      showAlert({
        type: "error",
        title: "İndirme başarısız",
        message,
        confirmText: "Tamam",
      });
    } finally {
      setDownloadingInvitation(false);
    }
  }

  async function handleDownloadQrPress() {
    if (!qrDownloadCardRef.current) {
      showAlert({
        type: "warning",
        title: "QR kart hazırlanamadı",
        message: "İndirilecek QR paylaşım kartı henüz hazır değil.",
        confirmText: "Tamam",
      });

      return;
    }

    try {
      setDownloadingQr(true);

      const qrCardImageUri = await captureRef(qrDownloadCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 1200,
        height: 900,
      });

      await downloadImageToGallery({
        imageUri: qrCardImageUri,
        fileNamePrefix: `weddion-qr-kart-${formData.brideName}-${formData.groomName}`,
      });

      showAlert({
        type: "success",
        title: "QR kart indirildi",
        message:
          Platform.OS === "ios"
            ? "QR paylaşım kartı Fotoğraflar uygulamasına kaydedildi."
            : "QR paylaşım kartı galerinize kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log("QR paylaşım kartı indirme hatası:", error);

      const message =
        error instanceof Error && error.message === "GALLERY_PERMISSION_DENIED"
          ? "QR paylaşım kartını galeriye kaydedebilmek için fotoğraf ekleme izni vermelisiniz. Ayarlar > Weddion > Fotoğraflar kısmından erişimi açın."
          : error instanceof Error && error.message === "UNSUPPORTED_IMAGE_URI"
            ? "QR paylaşım kartının dosya adresi desteklenmiyor. Lütfen tekrar deneyin."
            : "QR paylaşım kartı galeriye kaydedilemedi. Fotoğraf iznini kontrol edip tekrar deneyin.";

      showAlert({
        type: "error",
        title: "QR kart indirilemedi",
        message,
        confirmText: "Tamam",
      });
    } finally {
      setDownloadingQr(false);
    }
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

  function handleBackPress() {
    router.replace("/(tabs)/my-invitations");
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
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <ScreenHeader
            title="Paylaş"
            description="Davetiyenizi Instagram için hazırlayın."
            onBackPress={handleBackPress}
          />

          <InvitationEditSteps activeStep={3} />

          <InvitationShareReadyCard
            imageUrl={finalInvitationImageUri}
            onDownloadImagePress={handleDownloadInstagramImage}
            loading={downloadingInvitation}
          />

          <InvitationQrShareCard
            qrValue={qrValue}
            guestUploadCode={guestUploadCode}
            onCopyCodePress={handleCopyCodePress}
            onCopyLinkPress={handleCopyLinkPress}
            onDownloadQrPress={handleDownloadQrPress}
            qrDownloadLoading={downloadingQr}
          />

          <InvitationShareNoteCard />
        </ScrollView>

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -3000,
            top: -3000,
            width: 1200,
            height: 900,
            opacity: 1,
          }}
        >
          <InvitationQrDownloadCard
            ref={qrDownloadCardRef}
            qrValue={qrValue}
            brideName={formData.brideName}
            groomName={formData.groomName}
            guestUploadCode={guestUploadCode}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
