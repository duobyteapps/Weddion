import { ChangePasswordCard } from "@/components/profile/change-password/ChangePasswordCard";
import { ChangePasswordHeader } from "@/components/profile/change-password/ChangePasswordHeader";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { changePassword } from "@/services/authService";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalı.");
      return;
    }

    if (password !== passwordAgain) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    try {
      setSaving(true);
      await changePassword(password);
      Alert.alert("Başarılı", "Şifreniz güncellendi.");
      router.back();
    } catch (error) {
      Alert.alert(
        "Hata",
        error instanceof Error ? error.message : "Şifre güncellenemedi.",
      );
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
