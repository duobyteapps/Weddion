import { useAppAlert } from "@/components/ui/AppAlert";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationByGuestSlug } from "@/services/guestPhotoService";
import { Ionicons } from "@expo/vector-icons";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

function getSlugFromQrValue(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  try {
    const url = new URL(cleanValue);
    const parts = url.pathname.split("/").filter(Boolean);

    return parts[parts.length - 1] ?? "";
  } catch {
    return cleanValue;
  }
}

export default function GuestQrScanScreen() {
  const { showAlert } = useAppAlert();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanned || loading) {
      return;
    }

    const slug = getSlugFromQrValue(result.data);

    if (!slug) {
      showAlert({
        title: "QR kod okunamadı",
        message: "QR kod geçerli bir davet bağlantısı içermiyor.",
        type: "error",
        confirmText: "Tamam",
      });
      return;
    }

    try {
      setScanned(true);
      setLoading(true);

      const invitation = await getInvitationByGuestSlug(slug);

      if (!invitation) {
        showAlert({
          title: "Davetiye bulunamadı",
          message:
            "QR kod geçersiz veya bu davetiye için fotoğraf yükleme kapalı olabilir.",
          type: "error",
          confirmText: "Tekrar Dene",
          onConfirm: () => {
            setScanned(false);
          },
        });

        return;
      }

      router.replace({
        pathname: "/guest-photo-upload",
        params: {
          invitationId: invitation.id,
          guestUploadCode: invitation.guest_upload_code,
          guestUploadSlug: invitation.guest_upload_slug,
          brideName: invitation.bride_name,
          groomName: invitation.groom_name,
          eventDate: invitation.event_date ?? "",
          eventTime: invitation.event_time ?? "",
          venueName: invitation.venue_name ?? "",
        },
      });
    } catch (error) {
      console.log("QR kod kontrol edilemedi:", error);

      showAlert({
        title: "QR kontrol edilemedi",
        message:
          error instanceof Error
            ? error.message
            : "QR kod kontrol edilirken bir sorun oluştu. Lütfen tekrar deneyin.",
        type: "error",
        confirmText: "Tekrar Dene",
        onConfirm: () => {
          setScanned(false);
        },
      });
    } finally {
      setLoading(false);
    }
  }

  if (!permission) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator color="#A875D1" />
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 justify-center gap-5 px-6">
          <AppBackButton onPress={() => router.back()} />

          <View className="items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-accentLight">
              <Ionicons name="camera" size={32} color="#8F63D4" />
            </View>

            <AppText className="text-center text-2xl font-bold text-textDark">
              Kamera İzni Gerekli
            </AppText>

            <AppText className="text-center text-sm leading-6 text-textMuted">
              QR kodu okutabilmek için kamera izni vermeniz gerekiyor.
            </AppText>
          </View>

          <AppButton title="Kamera İzni Ver" onPress={requestPermission} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-black">
      <View className="flex-1">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        <View className="absolute left-0 right-0 top-0 px-5 pt-12">
          <AppBackButton onPress={() => router.back()} />
        </View>

        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 pb-10 pt-6">
          <View className="items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accentLight">
              <Ionicons name="qr-code" size={30} color="#8F63D4" />
            </View>

            <AppText className="text-center text-xl font-bold text-textDark">
              QR Kodu Okut
            </AppText>

            <AppText className="text-center text-sm leading-6 text-textMuted">
              Davetiyedeki QR kodu kamera alanına getirin. Kod okunduğunda
              fotoğraf yükleme ekranına otomatik yönlendirileceksiniz.
            </AppText>

            {loading ? (
              <View className="mt-2 flex-row items-center gap-2">
                <ActivityIndicator color="#A875D1" />

                <AppText className="text-sm text-textMuted">
                  QR kod kontrol ediliyor...
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
