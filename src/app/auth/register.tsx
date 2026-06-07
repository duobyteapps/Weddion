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
import { registerUser } from "@/services/authService";
import { validateRegisterForm } from "@/utils/authValidation";

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const validationError = validateRegisterForm(
      firstName,
      lastName,
      email,
      password,
    );

    if (validationError) {
      Alert.alert("Uyarı", validationError);
      return;
    }

    try {
      setIsLoading(true);

      await registerUser({
        firstName,
        lastName,
        email,
        password,
      });

      Alert.alert("Başarılı", "Hesabın oluşturuldu.", [
        {
          text: "Tamam",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kayıt oluşturulurken bir hata oluştu.";

      Alert.alert("Kayıt Hatası", message);
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
              Kayıt Ol
            </AppText>

            <AppText
              variant="caption"
              className="mt-1 text-center text-textMuted"
            >
              Yeni hesabını oluştur
            </AppText>
          </View>

          <View className="mt-6 gap-4">
            <View className="flex-row gap-3">
              <AppInput
                label="Ad"
                placeholder="Adınız"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                className="flex-1"
              />

              <AppInput
                label="Soyad"
                placeholder="Soyadınız"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                className="flex-1"
              />
            </View>

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
              placeholder="Şifre oluşturun"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <AppButton
              title="Kayıt Ol"
              className="mt-1"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleRegister}
            />

            <View className="flex-row items-center justify-center gap-1 pt-2">
              <AppText variant="caption" className="text-textLight">
                Zaten hesabın var mı?
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
