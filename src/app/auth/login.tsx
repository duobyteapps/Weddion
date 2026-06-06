import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { loginUser } from "@/services/authService";
import { validateLoginForm } from "@/utils/authValidation";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const validationError = validateLoginForm(email, password);

    if (validationError) {
      Alert.alert("Uyarı", validationError);
      return;
    }

    try {
      setIsLoading(true);

      await loginUser({
        email,
        password,
      });

      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Giriş yapılırken bir hata oluştu.";

      Alert.alert("Giriş Hatası", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="relative flex-1 px-1 pb-8 pt-4">
        <Image
          source={require("../../../assets/images/wedding-floral.png")}
          className="absolute -right-8 top-0 h-44 w-44 opacity-80"
          resizeMode="contain"
        />

        <AppBackButton onPress={() => router.replace("/")} />

        <AuthHeader />

        <AppCard className="mt-7">
          <View className="items-center">
            <AppText variant="subtitle" className="text-text">
              Giriş Yap
            </AppText>

            <AppText
              variant="caption"
              className="mt-1 text-center text-textMuted"
            >
              Hesabına giriş yap
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
            />

            <AppInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable onPress={() => {}} className="self-end">
              <AppText variant="captionStrong">Şifremi unuttum</AppText>
            </Pressable>

            <AppButton
              title="Giriş Yap"
              className="mt-1"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
            />

            <View className="flex-row items-center justify-center gap-1 pt-2">
              <AppText variant="caption" className="text-textLight">
                Hesabın yok mu?
              </AppText>

              <Pressable onPress={() => router.push("/auth/register")}>
                <AppText variant="captionStrong">Kayıt ol</AppText>
              </Pressable>
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
