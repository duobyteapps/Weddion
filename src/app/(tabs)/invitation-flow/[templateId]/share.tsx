import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";

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

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvitation, setDownloadingInvitation] = useState(false);

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

  function getInvitationDownloadFileName() {
    const bride = formData.brideName.trim() || "gelin";
    const groom = formData.groomName.trim() || "damat";
    const timestamp = Date.now();

    return `weddion-${bride}-${groom}-${timestamp}`
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

  function getFileExtensionFromUri(imageUri: string) {
    const cleanUri = imageUri.split("?")[0] ?? imageUri;
    const extensionMatch = cleanUri.match(/\.(png|jpg|jpeg|webp)$/i);

    if (!extensionMatch?.[1]) {
      return "png";
    }

    const extension = extensionMatch[1].toLowerCase();

    if (extension === "jpeg") {
      return "jpg";
    }

    return extension;
  }

  async function downloadRemoteImageToCache(imageUri: string) {
    const extension = getFileExtensionFromUri(imageUri);
    const fileName = `${getInvitationDownloadFileName()}.${extension}`;
    const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

    const result = await FileSystem.downloadAsync(imageUri, destinationUri);

    return result.uri;
  }

  async function copyLocalImageToCache(imageUri: string) {
    const extension = getFileExtensionFromUri(imageUri);
    const fileName = `${getInvitationDownloadFileName()}.${extension}`;
    const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationUri,
    });

    return destinationUri;
  }

  async function prepareImageForMediaLibrary(imageUri: string) {
    if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
      return downloadRemoteImageToCache(imageUri);
    }

    if (imageUri.startsWith("file://")) {
      return imageUri;
    }

    if (imageUri.startsWith("content://")) {
      return copyLocalImageToCache(imageUri);
    }

    throw new Error("UNSUPPORTED_IMAGE_URI");
  }

  async function handleDownloadInstagramImage() {
    if (!finalInvitationImageUri) {
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

      const permission = await MediaLibrary.requestPermissionsAsync(true, [
        "photo",
      ]);

      if (permission.status !== "granted") {
        showAlert({
          type: "warning",
          title: "İzin gerekli",
          message:
            "Davetiyeyi galeriye kaydedebilmek için fotoğraf kaydetme izni vermelisiniz.",
          confirmText: "Tamam",
        });

        return;
      }

      const localImageUri = await prepareImageForMediaLibrary(
        finalInvitationImageUri,
      );

      await MediaLibrary.Asset.create(localImageUri);

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
      console.log("Davetiye indirme hatası:", error);

      showAlert({
        type: "error",
        title: "İndirme başarısız",
        message:
          "Davetiye galeriye kaydedilemedi. Görsel bağlantısını ve izinleri kontrol edip tekrar deneyin.",
        confirmText: "Tamam",
      });
    } finally {
      setDownloadingInvitation(false);
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

  function handleDownloadQrPress() {
    showAlert({
      type: "info",
      title: "QR kod hazır",
      message:
        "QR indirme işlemini sonraki adımda aktif edeceğiz. Şu anda davetiye görseli indirme aktif.",
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
        contentContainerClassName="pb-10"
      >
        <ScreenHeader
          title="Paylaş"
          description="Davetiyenizi Instagram için hazırlayın."
          backTo={{
            pathname: "/my-invitations",
          }}
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
        />

        <InvitationShareNoteCard />
      </ScrollView>
    </ScreenContainer>
  );
}
