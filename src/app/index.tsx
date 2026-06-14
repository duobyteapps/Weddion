import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppLogo } from "@/components/ui/AppLogo";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <ScreenContainer className="bg-background">
      <View className="relative flex-1 justify-between pb-8 pt-14">
        <Image
          source={require("@/assets/images/backgrounds/lavender-bloom.png")}
          className="absolute -left-28 -top-1 h-60 w-60 opacity-85"
          resizeMode="contain"
        />

        <Image
          source={require("@/assets/images/backgrounds/floral-corner.png")}
          className="absolute -right-28 -top-1 h-60 w-60 opacity-85"
          resizeMode="contain"
        />

        <View className="items-center">
          <AppLogo size="lg" />

          <AppText
            variant="body"
            className="mt-3 px-6 text-center text-textMuted"
          >
            Online davetiye ve etkinlik platformu
          </AppText>
        </View>

        <View className="gap-5">
          <AppCard>
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-xl bg-accentLight">
                <AppText variant="subtitle" className="text-primaryDark">
                  ✦
                </AppText>
              </View>

              <View className="flex-1">
                <AppText variant="serifTitle" className="text-text">
                  Davetiyeni zarifçe oluştur
                </AppText>
              </View>
            </View>

            <AppText variant="body" className="mt-5 text-textMuted">
              Misafirlerini yönet, katılım al ve etkinlik anılarını tek yerde
              topla.
            </AppText>

            <View className="my-5 h-[1px] bg-border" />

            <View className="gap-4">
              <Pressable
                onPress={() => {
                  /*
                    QR scanner sayfasını oluşturduğunda burayı bağla.
                    Örnek:
                    router.push("/guest/qr-scan");
                  */
                }}
                className="flex-row items-center rounded-xl border border-primaryLight p-3"
              >
                <View className="h-[112px] w-[112px] items-center justify-center rounded-2xl bg-white">
                  <View className="h-10 w-10 items-center justify-center rounded-xl border border-primaryLight bg-background">
                    <Ionicons name="camera-outline" size={28} color="#8F63D4" />
                  </View>

                  <View className="absolute left-4 top-4 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary" />
                  <View className="absolute right-4 top-4 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary" />
                  <View className="absolute bottom-4 left-4 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary" />
                  <View className="absolute bottom-4 right-4 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary" />
                </View>

                <View className="ml-4 flex-1">
                  <AppText variant="serifSubtitle">
                    QR kod okutarak fotoğraf yükle
                  </AppText>

                  <AppText variant="body">
                    Misafirleriniz anıları kolayca yüklensin ve görüntülensin.
                  </AppText>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#8D8796" />
              </Pressable>

              <Pressable
                onPress={() => {
                  /*
                    Kod girme modalını veya kod sayfasını oluşturduğunda burayı bağla.
                    Örnek:
                    router.push("/guest/code-upload");
                  */
                }}
                className="flex-row items-center rounded-xl border border-primaryLight p-3"
              >
                <View className="h-[112px] w-[112px] items-center justify-center rounded-2xl bg-white">
                  <View className="h-10 w-10 items-center justify-center rounded-xl border border-primaryLight bg-background">
                    <Ionicons name="keypad-outline" size={28} color="#8F63D4" />
                  </View>
                </View>

                <View className="ml-4 flex-1">
                  <AppText variant="serifSubtitle">
                    Kod girerek fotoğraf yükle
                  </AppText>

                  <AppText variant="body">
                    Etkinlik kodunu girerek fotoğraflarınızı yükleyin.
                  </AppText>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#8D8796" />
              </Pressable>
            </View>
          </AppCard>

          <View className="gap-3">
            <AppButton
              title="Giriş Yap"
              onPress={() => router.push("/auth/login")}
            />

            <AppButton
              title="Üye Ol"
              variant="secondary"
              onPress={() => router.push("/auth/register")}
            />
          </View>
        </View>

        <View className="items-center">
          <AppText variant="caption" className="text-center text-textLight">
            Weddion ile davetiyeler artık daha romantik ve modern.
          </AppText>

          <Image
            source={require("../../assets/images/wedding-divider.png")}
            className="mt-3 h-5 w-40 opacity-70"
            resizeMode="contain"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
