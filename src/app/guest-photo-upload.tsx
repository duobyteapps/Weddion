import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  getGuestPhotoLimitUsage,
  MAX_PHOTOS_PER_INVITATION,
  MAX_PHOTOS_PER_UPLOAD,
  uploadGuestPhoto,
  validateGuestPhotoBatchLimit,
  type GuestPhotoLimitUsage,
} from "@/services/guestPhotoService";

type GuestPhotoUploadParams = {
  invitationId?: string;
  guestUploadCode?: string;
  guestUploadSlug?: string;
  brideName?: string;
  groomName?: string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
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
  const [photoLimitUsage, setPhotoLimitUsage] =
    useState<GuestPhotoLimitUsage | null>(null);

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

  const usedPhotoCount = photoLimitUsage?.used ?? 0;
  const photoLimit = photoLimitUsage?.limit ?? MAX_PHOTOS_PER_INVITATION;
  const remainingPhotoCount = photoLimitUsage?.remaining ?? photoLimit;
  const selectedPhotoCount = selectedPhotos.length;

  const currentSelectableCount = Math.max(
    Math.min(
      MAX_PHOTOS_PER_UPLOAD - selectedPhotoCount,
      remainingPhotoCount - selectedPhotoCount,
    ),
    0,
  );

  const isPhotoLimitFull = remainingPhotoCount <= 0;
  const isSelectionLimitFull = currentSelectableCount <= 0;

  const loadPhotoLimitUsage = useCallback(async () => {
    if (!invitationId) {
      return;
    }

    try {
      const usage = await getGuestPhotoLimitUsage(invitationId);
      setPhotoLimitUsage(usage);
    } catch (error) {
      console.log("Fotoğraf limit bilgisi alınamadı:", error);
    }
  }, [invitationId]);

  useEffect(() => {
    loadPhotoLimitUsage();
  }, [loadPhotoLimitUsage]);

  function showLimitAlert() {
    if (isPhotoLimitFull) {
      showAlert({
        title: "Fotoğraf limiti doldu",
        message: `Bu davet için en fazla ${photoLimit} fotoğraf yüklenebilir.`,
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    showAlert({
      title: "Seçim limiti doldu",
      message: `Tek seferde en fazla ${MAX_PHOTOS_PER_UPLOAD} fotoğraf seçebilirsiniz.`,
      type: "warning",
      confirmText: "Tamam",
    });
  }

  async function handleGalleryPress() {
    if (isPhotoLimitFull || isSelectionLimitFull) {
      showLimitAlert();
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
      selectionLimit: currentSelectableCount,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedAssets = result.assets.slice(0, currentSelectableCount);

    if (selectedAssets.length === 0) {
      showLimitAlert();
      return;
    }

    setSelectedPhotos((currentPhotos) => [
      ...currentPhotos,
      ...selectedAssets.map((asset) => createSelectedPhoto(asset.uri)),
    ]);
  }

  async function handleCameraPress() {
    if (isPhotoLimitFull || isSelectionLimitFull) {
      showLimitAlert();
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

    try {
      setUploading(true);

      await validateGuestPhotoBatchLimit(invitationId, selectedPhotos.length);

      for (const photo of selectedPhotos) {
        await uploadGuestPhoto({
          invitationId,
          guestUploadCode,
          imageUri: photo.uri,
        });
      }

      setSelectedPhotos([]);
      await loadPhotoLimitUsage();

      showAlert({
        title: "Fotoğraflar yüklendi",
        message:
          "Seçtiğiniz fotoğraflar başarıyla gönderildi. İsterseniz yeni fotoğraf eklemeye devam edebilirsiniz.",
        type: "success",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log("Fotoğraflar yüklenemedi:", error);

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
        contentContainerClassName="pb-32"
      >
        <AppBackButton onPress={handleBack} />

        <GuestPhotoEventHeader title={eventTitle} date={eventDateText} />

        <GuestPhotoUploadIntro />

        <View className="gap-5">
          <View className="rounded-2xl border border-border bg-surface px-4 py-3">
            <View className="flex-row items-center justify-between">
              <AppText className="text-sm font-semibold text-text">
                Fotoğraf limiti
              </AppText>

              <AppText className="text-sm font-bold text-primary">
                {usedPhotoCount}/{photoLimit}
              </AppText>
            </View>

            <AppText className="mt-1 text-xs text-textMuted">
              Tek seferde en fazla {MAX_PHOTOS_PER_UPLOAD} fotoğraf
              yükleyebilirsiniz. Kalan hak:{" "}
              {Math.max(remainingPhotoCount - selectedPhotoCount, 0)}
            </AppText>
          </View>

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
            title={
              uploading
                ? "Yükleniyor..."
                : isPhotoLimitFull
                  ? "Fotoğraf Limiti Doldu"
                  : "Fotoğrafları Yükle"
            }
            onPress={handleUploadPhotos}
            disabled={
              uploading || selectedPhotos.length === 0 || isPhotoLimitFull
            }
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
