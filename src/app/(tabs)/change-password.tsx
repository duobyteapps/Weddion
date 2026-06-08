import { ChangePasswordCard } from "@/components/profile/change-password/ChangePasswordCard";
import { ChangePasswordHeader } from "@/components/profile/change-password/ChangePasswordHeader";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { changePassword } from "@/services/authService";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function ChangePasswordScreen() {
  const { showAlert } = useAppAlert();

  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (password.length < 6) {
      showAlert({
        title: "Şifre Hatası",
        message: "Şifre en az 6 karakter olmalı.",
        type: "warning",
      });
      return;
    }

    if (password !== passwordAgain) {
      showAlert({
        title: "Şifreler Eşleşmiyor",
        message: "Lütfen iki alana da aynı şifreyi girin.",
        type: "warning",
      });
      return;
    }

    try {
      setSaving(true);

      await changePassword(password);

      showAlert({
        title: "Şifre Güncellendi",
        message: "Şifreniz başarıyla güncellendi.",
        type: "success",
        confirmText: "Tamam",
        onConfirm: () => router.back(),
      });
    } catch (error) {
      showAlert({
        title: "Şifre Güncellenemedi",
        message:
          error instanceof Error ? error.message : "Şifre güncellenemedi.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ChangePasswordHeader />

        <ChangePasswordCard
          password={password}
          passwordAgain={passwordAgain}
          onChangePassword={setPassword}
          onChangePasswordAgain={setPasswordAgain}
        />

        <AppButton
          title="Şifreyi Güncelle"
          loading={saving}
          onPress={handleSave}
          className="mt-16"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
