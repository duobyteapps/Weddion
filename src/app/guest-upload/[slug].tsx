import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationByGuestSlug } from "@/services/guestPhotoService";

type GuestUploadSlugParams = {
  slug?: string;
};

function cleanParam(value?: string) {
  if (!value || value.trim().length === 0) {
    return "";
  }

  return value.trim();
}

export default function GuestUploadSlugScreen() {
  const params = useLocalSearchParams<GuestUploadSlugParams>();
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    handleSlugAccess();
  }, [params.slug]);

  async function handleSlugAccess() {
    const slug = cleanParam(params.slug);

    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);

      const invitation = await getInvitationByGuestSlug(slug);

      if (!invitation) {
        setNotFound(true);

        showAlert({
          title: "Davetiye bulunamadı",
          message:
            "QR kod geçersiz veya bu davetiye için fotoğraf yükleme kapalı olabilir.",
          type: "error",
          confirmText: "Tamam",
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
      console.log("QR davetiye kontrol edilemedi:", error);

      setNotFound(true);

      showAlert({
        title: "QR kontrol edilemedi",
        message:
          error instanceof Error
            ? error.message
            : "QR kod kontrol edilirken bir sorun oluştu. Lütfen tekrar deneyin.",
        type: "error",
        confirmText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCodeAccessPress() {
    router.replace("/guest-photo-access");
  }

  if (loading) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator color="#A875D1" />

          <AppText className="mt-3 text-center text-textMuted">
            QR kod kontrol ediliyor...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (notFound) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 justify-center gap-5 px-6">
          <View className="gap-2">
            <AppText className="text-center text-2xl font-bold text-textDark">
              Davetiye bulunamadı
            </AppText>

            <AppText className="text-center text-sm leading-6 text-textMuted">
              QR kod geçersiz olabilir. Dilerseniz davet kodu ile giriş
              yapabilirsiniz.
            </AppText>
          </View>

          <AppButton title="Kod ile Devam Et" onPress={handleCodeAccessPress} />
        </View>
      </ScreenContainer>
    );
  }

  return null;
}
