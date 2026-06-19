import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { GuestPhotoEventHeader } from "@/components/guest-photo/guest-photo-upload/GuestPhotoEventHeader";
import { GuestPhotoPrivacyNotice } from "@/components/guest-photo/guest-photo-upload/GuestPhotoPrivacyNotice";
import { GuestPhotoSelectedSection } from "@/components/guest-photo/guest-photo-upload/GuestPhotoSelectedSection";
import { GuestPhotoSourceActions } from "@/components/guest-photo/guest-photo-upload/GuestPhotoSourceActions";
import { GuestPhotoUploadIntro } from "@/components/guest-photo/guest-photo-upload/GuestPhotoUploadIntro";
import type { SelectedPhoto } from "@/components/guest-photo/guest-photo-upload/types";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { uploadGuestPhotos } from "@/services/guestPhotoService";

const MAX_PHOTOS_PER_UPLOAD = 20;

type GuestPhotoUploadParams = {
  invitationId?: string;
  guestUploadCode?: string;
  guestUploadSlug?: string;
  brideName?: string;
  groomName?: string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  backTo?: string;
};

function cleanParam(value?: string) {
  if (!value || value.trim().length === 0) {
    return "";
  }

  return value;
}

function createSelectedPhoto(uri: string): SelectedPhoto {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    uri,
  };
}

export default function GuestPhotoUploadScreen() {
  const params = useLocalSearchParams<GuestPhotoUploadParams>();
  const { showAlert } = useAppAlert();

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const invitationId = useMemo(
    () => cleanParam(params.invitationId),
    [params.invitationId],
  );

  const guestUploadCode = useMemo(
    () => cleanParam(params.guestUploadCode),
    [params.guestUploadCode],
  );

  const brideName = useMemo(
    () => cleanParam(params.brideName),
    [params.brideName],
  );

  const groomName = useMemo(
    () => cleanParam(params.groomName),
    [params.groomName],
  );

  const eventDate = useMemo(
    () => cleanParam(params.eventDate),
    [params.eventDate],
  );

  const eventTime = useMemo(
    () => cleanParam(params.eventTime),
    [params.eventTime],
  );

  const backTo = useMemo(() => cleanParam(params.backTo), [params.backTo]);

  const eventTitle = useMemo(() => {
    if (brideName && groomName) {
      return `${brideName} & ${groomName}`;
    }

    return "Davetiye";
  }, [brideName, groomName]);

  const eventDateText = useMemo(() => {
    if (eventDate && eventTime) {
      return `${eventDate} • ${eventTime}`;
    }

    return eventDate;
  }, [eventDate, eventTime]);

  const remainingSelectableCount = Math.max(
    MAX_PHOTOS_PER_UPLOAD - selectedPhotos.length,
    0,
  );

  function showSelectionLimitAlert() {
    showAlert({
      title: "Seçim limiti",
      message: `Tek seferde en fazla ${MAX_PHOTOS_PER_UPLOAD} fotoğraf yükleyebilirsiniz.`,
      type: "warning",
      confirmText: "Tamam",
    });
  }

  async function handleGalleryPress() {
    if (selectedPhotos.length >= MAX_PHOTOS_PER_UPLOAD) {
      showSelectionLimitAlert();
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showAlert({
        title: "İzin gerekli",
        message: "Fotoğraf seçebilmek için galeri izni vermeniz gerekiyor.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      allowsEditing: false,
      selectionLimit: remainingSelectableCount,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedAssets = result.assets.slice(0, remainingSelectableCount);

    if (selectedAssets.length === 0) {
      showSelectionLimitAlert();
      return;
    }

    setSelectedPhotos((currentPhotos) => [
      ...currentPhotos,
      ...selectedAssets.map((asset) => createSelectedPhoto(asset.uri)),
    ]);
  }

  async function handleCameraPress() {
    if (selectedPhotos.length >= MAX_PHOTOS_PER_UPLOAD) {
      showSelectionLimitAlert();
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      showAlert({
        title: "İzin gerekli",
        message: "Fotoğraf çekebilmek için kamera izni vermeniz gerekiyor.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setSelectedPhotos((currentPhotos) => [
      ...currentPhotos,
      createSelectedPhoto(result.assets[0].uri),
    ]);
  }

  function handleRemovePhoto(photoId: string) {
    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId),
    );
  }

  function handleRemoveAllPhotos() {
    setSelectedPhotos([]);
  }

  async function handleUploadPhotos() {
    if (!invitationId || !guestUploadCode) {
      showAlert({
        title: "Davetiye bulunamadı",
        message: "Fotoğraf yüklemek için geçerli bir davet kodu gerekiyor.",
        type: "error",
        confirmText: "Tamam",
      });
      return;
    }

    if (selectedPhotos.length === 0) {
      showAlert({
        title: "Fotoğraf seçin",
        message: "Yüklemek istediğiniz en az bir fotoğraf seçin.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    if (selectedPhotos.length > MAX_PHOTOS_PER_UPLOAD) {
      showSelectionLimitAlert();
      return;
    }

    try {
      setUploading(true);

      const photoCount = selectedPhotos.length;

      await uploadGuestPhotos({
        invitationId,
        guestUploadCode,
        imageUris: selectedPhotos.map((photo) => photo.uri),
      });

      setSelectedPhotos([]);

      showAlert({
        title: "Fotoğraflar yüklendi",
        message:
          photoCount > 1
            ? `${photoCount} fotoğraf başarıyla gönderildi. İsterseniz yeni fotoğraf eklemeye devam edebilirsiniz.`
            : "Fotoğraf başarıyla gönderildi. İsterseniz yeni fotoğraf eklemeye devam edebilirsiniz.",
        type: "success",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log(
        "Fotoğraflar yüklenemedi:",
        error instanceof Error ? error.message : error,
      );

      showAlert({
        title: "Fotoğraflar yüklenemedi",
        message:
          error instanceof Error
            ? error.message
            : "Fotoğraf yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
        type: "error",
        confirmText: "Tamam",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleBack() {
    if (backTo) {
      router.replace(backTo as any);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <AppBackButton onPress={handleBack} />

        <GuestPhotoEventHeader title={eventTitle} date={eventDateText} />

        <GuestPhotoUploadIntro />

        <View className="gap-5">
          <GuestPhotoSourceActions
            onCameraPress={handleCameraPress}
            onGalleryPress={handleGalleryPress}
          />

          <GuestPhotoSelectedSection
            selectedPhotos={selectedPhotos}
            onRemovePhoto={handleRemovePhoto}
            onRemoveAllPhotos={handleRemoveAllPhotos}
          />

          <GuestPhotoPrivacyNotice />

          <AppButton
            title={uploading ? "Yükleniyor..." : "Fotoğrafları Yükle"}
            onPress={handleUploadPhotos}
            disabled={uploading || selectedPhotos.length === 0}
          />

          {uploading ? (
            <AppText className="text-center text-sm text-textMuted">
              Fotoğraflar yükleniyor, lütfen bekleyin...
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
