import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { requestGalleryPartnerAccessByCode } from "@/services/galleryPartnerService";

export default function GalleryPartnerAccessScreen() {
  const { showAlert } = useAppAlert();
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      showAlert({
        title: "Kod Eksik",
        message: "Lütfen geçerli bir galeri ortak kodu girin.",
        type: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);

      await requestGalleryPartnerAccessByCode({
        code: normalizedCode,
        displayName,
      });

      setCode("");
      setDisplayName("");

      showAlert({
        title: "İstek Gönderildi",
        message:
          "Davetiye sahibi isteğini onayladığında galeriye erişebileceksin.",
        type: "success",
        confirmText: "Tamam",
        onConfirm: () => router.replace("/gallery"),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Galeri ortak isteği gönderilirken bir hata oluştu.";

      showAlert({
        title: "İstek Gönderilemedi",
        message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Galeriye Katıl" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppCard className="mt-5">
            <View className="gap-4">
              <View>
                <AppText variant="title" className="text-textDark">
                  Galeri Ortak Kodu
                </AppText>

                <AppText className="mt-2 text-textMuted">
                  Partner olmak istediğin galerinin ortak kodunu gir. İstek
                  davetiye sahibine gider, onaylanınca galeriye erişebilirsin.
                </AppText>
              </View>

              <AppInput
                label="Adın"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Örn. Nisa"
                autoCapitalize="words"
              />

              <AppInput
                label="Galeri Ortak Kodu"
                value={code}
                onChangeText={(value) => setCode(value.toUpperCase())}
                placeholder="ABC123"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
              />

              <AppButton
                title="İstek Gönder"
                loading={submitting}
                onPress={handleSubmit}
              />
            </View>
          </AppCard>

          {submitting ? (
            <View className="mt-6 items-center">
              <ActivityIndicator />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
