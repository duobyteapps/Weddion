import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationByGuestCode } from "@/services/guestPhotoService";
import type { GuestInvitationAccess } from "@/types/invitation";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export default function GuestPhotoAccessScreen() {
  const { showAlert } = useAppAlert();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<GuestInvitationAccess | null>(
    null,
  );

  async function handleSubmitCode() {
    const normalizedCode = normalizeCode(code);

    if (!normalizedCode) {
      showAlert({
        title: "Kod gerekli",
        message: "Fotoğraf yüklemek için davet kodunu girin.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    try {
      setLoading(true);

      const data = await getInvitationByGuestCode(normalizedCode);

      if (!data) {
        setInvitation(null);

        showAlert({
          title: "Kod bulunamadı",
          message:
            "Girdiğiniz davet kodu geçersiz veya fotoğraf yükleme kapalı olabilir.",
          type: "error",
          confirmText: "Tamam",
        });

        return;
      }

      setInvitation(data);
    } catch (error) {
      console.log("Davet kodu kontrol edilemedi:", error);

      showAlert({
        title: "Kod kontrol edilemedi",
        message:
          error instanceof Error
            ? error.message
            : "Kod kontrol edilirken bir sorun oluştu. Lütfen tekrar deneyin.",
        type: "error",
        confirmText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (!invitation) {
      return;
    }

    router.push({
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
  }

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-5 pb-32 pt-8"
        >
          <View className="flex-1 justify-center gap-6">
            <View className="gap-3">
              <AppText className="text-center text-2xl font-bold text-textDark">
                Fotoğraf Yükle
              </AppText>

              <AppText className="text-center text-sm leading-6 text-textMuted">
                Davet kodunu girerek giriş yapmadan fotoğraf yükleyebilirsiniz.
              </AppText>
            </View>

            <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <View className="gap-2">
                <AppText className="text-sm font-semibold text-textDark">
                  Davet Kodu
                </AppText>

                <AppInput
                  value={code}
                  onChangeText={(value) => {
                    setCode(value.toUpperCase());
                    setInvitation(null);
                  }}
                  placeholder="Örn: WDN-50B719"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <AppButton
                title={loading ? "Kontrol ediliyor..." : "Kodu Kontrol Et"}
                onPress={handleSubmitCode}
                disabled={loading}
              />

              {loading ? (
                <View className="items-center py-2">
                  <ActivityIndicator color="#A875D1" />
                </View>
              ) : null}
            </View>

            {invitation ? (
              <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
                <View className="gap-2">
                  <AppText className="text-center text-lg font-bold text-textDark">
                    {invitation.bride_name} & {invitation.groom_name}
                  </AppText>

                  {invitation.event_date ? (
                    <AppText className="text-center text-sm text-textMuted">
                      {invitation.event_date}
                      {invitation.event_time
                        ? ` • ${invitation.event_time}`
                        : ""}
                    </AppText>
                  ) : null}

                  {invitation.venue_name ? (
                    <AppText className="text-center text-sm text-textMuted">
                      {invitation.venue_name}
                    </AppText>
                  ) : null}
                </View>

                <AppButton
                  title="Fotoğraf Yüklemeye Devam Et"
                  onPress={handleContinue}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
