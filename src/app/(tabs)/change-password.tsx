import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { ChangePasswordCard } from "@/components/profile/change-password/ChangePasswordCard";
import { ChangePasswordHeader } from "@/components/profile/change-password/ChangePasswordHeader";
import { ChangePasswordHero } from "@/components/profile/change-password/ChangePasswordHero";
import { SecurityInfoCard } from "@/components/profile/change-password/SecurityInfoCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordScreen() {
  const { showAlert } = useAppAlert();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      showAlert({
        type: "warning",
        title: "Eksik Bilgi",
        message: "Lütfen tüm şifre alanlarını doldurun.",
      });
      return;
    }

    if (newPassword.length < 8) {
      showAlert({
        type: "warning",
        title: "Şifre Çok Kısa",
        message: "Yeni şifreniz en az 8 karakter olmalıdır.",
      });
      return;
    }

    if (newPassword !== repeatPassword) {
      showAlert({
        type: "error",
        title: "Şifreler Eşleşmiyor",
        message: "Yeni şifre ve tekrar şifre alanları aynı olmalıdır.",
      });
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      setLoading(false);
      showAlert({
        type: "error",
        title: "Kullanıcı Bulunamadı",
        message: "Oturum bilgilerinize ulaşılamadı. Lütfen tekrar giriş yapın.",
      });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setLoading(false);
      showAlert({
        type: "error",
        title: "Mevcut Şifre Hatalı",
        message: "Girdiğiniz mevcut şifre doğru değil.",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      showAlert({
        type: "error",
        title: "Şifre Güncellenemedi",
        message: "Şifreniz güncellenirken bir hata oluştu.",
      });
      return;
    }

    showAlert({
      type: "success",
      title: "Şifre Güncellendi",
      message: "Şifreniz başarıyla güncellendi.",
      onConfirm: () => router.back(),
    });
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
        >
          <ChangePasswordHeader onBackPress={() => router.back()} />

          <ChangePasswordHero />

          <View className="-mt-2">
            <ChangePasswordCard
              currentPassword={currentPassword}
              newPassword={newPassword}
              repeatPassword={repeatPassword}
              loading={loading}
              onChangeCurrentPassword={setCurrentPassword}
              onChangeNewPassword={setNewPassword}
              onChangeRepeatPassword={setRepeatPassword}
              onSubmit={handleSubmit}
            />
          </View>

          <SecurityInfoCard />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
