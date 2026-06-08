import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function handlePasswordResetLink() {
      const url = await Linking.getInitialURL();

      if (!url) {
        setSessionReady(true);
        return;
      }

      const normalizedUrl = url.replace("#", "?");
      const parsedUrl = new URL(normalizedUrl);

      const accessToken = parsedUrl.searchParams.get("access_token");
      const refreshToken = parsedUrl.searchParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setSessionReady(true);
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        showAlert({
          title: "Bağlantı Geçersiz",
          message: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
          type: "error",
        });
      }

      setSessionReady(true);
    }

    handlePasswordResetLink();
  }, [showAlert]);

  async function handleUpdatePassword() {
    if (!sessionReady) {
      showAlert({
        title: "Hazırlanıyor",
        message: "Şifre sıfırlama bağlantısı hazırlanıyor.",
        type: "info",
      });
      return;
    }

    if (!password || !confirmPassword) {
      showAlert({
        title: "Eksik Bilgi",
        message: "Lütfen tüm alanları doldurun.",
        type: "warning",
      });
      return;
    }

    if (password.length < 6) {
      showAlert({
        title: "Şifre Çok Kısa",
        message: "Şifre en az 6 karakter olmalı.",
        type: "warning",
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: "Şifreler Eşleşmiyor",
        message: "Lütfen iki alana da aynı şifreyi girin.",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      showAlert({
        title: "Şifre Güncellenemedi",
        message: error.message,
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Şifre Güncellendi",
      message: "Yeni şifren başarıyla kaydedildi.",
      type: "success",
      confirmText: "Giriş Yap",
      onConfirm: () => router.replace("/auth/login"),
    });
  }

  return (
    <ScreenContainer className="bg-background">
      <View className="relative flex-1 px-1 pb-8 pt-4">
        <Image
          source={require("../../../assets/images/backgrounds/wedding-floral.png")}
          className="absolute -right-8 top-0 h-44 w-44 opacity-80"
          resizeMode="contain"
        />

        <AppBackButton onPress={() => router.back()} />

        <AuthHeader />

        <AppCard className="mt-7">
          <View className="items-center">
            <AppText variant="subtitle" className="text-text">
              Yeni Şifre Oluştur
            </AppText>

            <AppText
              variant="caption"
              className="mt-1 text-center text-textMuted"
            >
              Hesabın için yeni ve güvenli bir şifre belirle
            </AppText>
          </View>

          <View className="mt-6 gap-4">
            <AppInput
              label="Yeni Şifre"
              placeholder="Yeni şifreniz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <AppInput
              label="Yeni Şifre Tekrar"
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <AppButton
              title={loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              className="mt-1"
              onPress={handleUpdatePassword}
            />

            <View className="flex-row items-center justify-center gap-1 pt-2">
              <AppText variant="caption" className="text-textLight">
                Şifren güncellendiyse
              </AppText>

              <Pressable onPress={() => router.push("/auth/login")}>
                <AppText variant="captionStrong">Giriş yap</AppText>
              </Pressable>
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
