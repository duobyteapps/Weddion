import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import AppKeyboardAvoidingView from "@/components/ui/AppKeyboardAvoidingView";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { supabase } from "@/lib/supabase";

function getUrlParam(url: string, paramName: string) {
  try {
    const parsedUrl = new URL(url);

    const queryValue = parsedUrl.searchParams.get(paramName);

    if (queryValue) {
      return queryValue;
    }

    const hash = parsedUrl.hash.replace(/^#/, "");

    if (!hash) {
      return null;
    }

    const hashParams = new URLSearchParams(hash);

    return hashParams.get(paramName);
  } catch {
    return null;
  }
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [sessionReady, setSessionReady] = useState(false);

  const prepareRecoverySession = useCallback(
    async (url: string | null) => {
      try {
        setSessionLoading(true);
        setSessionReady(false);

        if (!url) {
          throw new Error("Şifre sıfırlama bağlantısı bulunamadı.");
        }

        const code = getUrlParam(url, "code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (!session) {
            throw new Error("Şifre sıfırlama oturumu oluşturulamadı.");
          }

          setSessionReady(true);
          return;
        }

        const accessToken = getUrlParam(url, "access_token");

        const refreshToken = getUrlParam(url, "refresh_token");

        const type = getUrlParam(url, "type");

        if (accessToken && refreshToken && (!type || type === "recovery")) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (!session) {
            throw new Error("Şifre sıfırlama oturumu oluşturulamadı.");
          }

          setSessionReady(true);
          return;
        }

        throw new Error(
          "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
        );
      } catch (error) {
        setSessionReady(false);

        showAlert({
          title: "Bağlantı Geçersiz",
          message:
            error instanceof Error
              ? error.message
              : "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
          type: "error",
          confirmText: "Tamam",
        });
      } finally {
        setSessionLoading(false);
      }
    },
    [showAlert],
  );

  useEffect(() => {
    let mounted = true;

    async function initializeRecovery() {
      const initialUrl = await Linking.getInitialURL();

      if (!mounted) {
        return;
      }

      await prepareRecoverySession(initialUrl);
    }

    initializeRecovery();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      prepareRecoverySession(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [prepareRecoverySession]);

  async function handleUpdatePassword() {
    if (sessionLoading) {
      showAlert({
        title: "Hazırlanıyor",
        message: "Şifre sıfırlama bağlantısı hazırlanıyor.",
        type: "info",
        confirmText: "Tamam",
      });
      return;
    }

    if (!sessionReady) {
      showAlert({
        title: "Bağlantı Geçersiz",
        message: "Geçerli bir şifre sıfırlama bağlantısı ile tekrar deneyin.",
        type: "error",
        confirmText: "Tamam",
      });
      return;
    }

    if (!password || !confirmPassword) {
      showAlert({
        title: "Eksik Bilgi",
        message: "Lütfen tüm alanları doldurun.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    if (password.length < 8) {
      showAlert({
        title: "Şifre Çok Kısa",
        message: "Şifre en az 8 karakter olmalı.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    const hasLowercase = /[a-z]/.test(password);

    const hasUppercase = /[A-Z]/.test(password);

    const hasNumber = /\d/.test(password);

    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialCharacter) {
      showAlert({
        title: "Şifre Yeterince Güçlü Değil",
        message:
          "Şifreniz en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: "Şifreler Eşleşmiyor",
        message: "Lütfen iki alana da aynı şifreyi girin.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.log(
          "Şifre değiştikten sonra session kapatılamadı:",
          signOutError,
        );
      }

      setPassword("");
      setConfirmPassword("");
      setSessionReady(false);

      showAlert({
        title: "Şifre Güncellendi",
        message:
          "Yeni şifren başarıyla kaydedildi. Yeni şifrenle giriş yapabilirsin.",
        type: "success",
        confirmText: "Giriş Yap",
        onConfirm: () => router.replace("/auth/login"),
      });
    } catch (error) {
      showAlert({
        title: "Şifre Güncellenemedi",
        message:
          error instanceof Error
            ? error.message
            : "Şifre güncellenirken bir sorun oluştu.",
        type: "error",
        confirmText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer className="bg-background">
      <AppKeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow pb-8"
        >
          <View className="relative flex-1 px-1 pt-4">
            <Image
              source={require("../../../assets/images/backgrounds/wedding-floral.png")}
              className="absolute -right-8 top-0 h-44 w-44 opacity-80"
              resizeMode="contain"
            />

            <AppBackButton onPress={() => router.replace("/auth/login")} />

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

              {sessionLoading ? (
                <View className="mt-8 items-center gap-3 py-6">
                  <ActivityIndicator color="#A875D1" />

                  <AppText
                    variant="caption"
                    className="text-center text-textMuted"
                  >
                    Şifre sıfırlama bağlantısı hazırlanıyor...
                  </AppText>
                </View>
              ) : (
                <View className="mt-6 gap-4">
                  <AppInput
                    label="Yeni Şifre"
                    placeholder="Yeni şifreniz"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={sessionReady && !loading}
                  />

                  <AppInput
                    label="Yeni Şifre Tekrar"
                    placeholder="Yeni şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={sessionReady && !loading}
                  />

                  <AppText variant="caption" className="text-textMuted">
                    En az 8 karakter, bir büyük harf, bir küçük harf, bir sayı
                    ve bir özel karakter kullan.
                  </AppText>

                  <AppButton
                    title={loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                    className="mt-1"
                    onPress={handleUpdatePassword}
                    disabled={loading || sessionLoading || !sessionReady}
                  />

                  <View className="flex-row items-center justify-center gap-1 pt-2">
                    <AppText variant="caption" className="text-textLight">
                      Şifren güncellendiyse
                    </AppText>

                    <Pressable
                      onPress={() => router.replace("/auth/login")}
                      disabled={loading}
                    >
                      <AppText variant="captionStrong">Giriş yap</AppText>
                    </Pressable>
                  </View>
                </View>
              )}
            </AppCard>
          </View>
        </ScrollView>
      </AppKeyboardAvoidingView>
    </ScreenContainer>
  );
}
