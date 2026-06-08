import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendResetLink() {
    if (!email.trim()) {
      showAlert({
        title: "E-posta Gerekli",
        message: "Lütfen e-posta adresinizi girin.",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "weddion://auth/reset-password",
    });

    setLoading(false);

    if (error) {
      showAlert({
        title: "Bağlantı Gönderilemedi",
        message: error.message,
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Bağlantı Gönderildi",
      message: "Şifre sıfırlama bağlantısı e-posta adresine gönderildi.",
      type: "success",
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
              Şifremi Unuttum
            </AppText>

            <AppText
              variant="caption"
              className="mt-1 text-center text-textMuted"
            >
              E-posta adresini gir, şifre yenileme bağlantısını gönderelim
            </AppText>
          </View>

          <View className="mt-6 gap-4">
            <AppInput
              label="E-posta"
              placeholder="E-posta adresiniz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppButton
              title={
                loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"
              }
              className="mt-1"
              onPress={handleSendResetLink}
            />

            <View className="flex-row items-center justify-center gap-1 pt-2">
              <AppText variant="caption" className="text-textLight">
                Şifreni hatırladın mı?
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
