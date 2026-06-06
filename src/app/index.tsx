import { useRouter } from "expo-router";
import { Image, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppLogo } from "@/components/ui/AppLogo";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="bg-background">
      <View className="relative flex-1 justify-between pb-8 pt-14">
        <Image
          source={require("../../assets/images/lavender-bloom.png")}
          className="absolute -left-28 -top-1 h-60 w-60 opacity-85"
          resizeMode="contain"
        />

        <Image
          source={require("../../assets/images/floral-corner.png")}
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
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accentLight">
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
              Misafirlerini yönet, QR kod ile katılım al ve etkinlik anılarını
              tek yerde topla.
            </AppText>

            <View className="my-5 h-[1px] bg-border" />

            <View className="flex-row items-center gap-4">
              <View className="h-[116px] w-[116px] items-center justify-center rounded-2xl border border-primaryLight bg-backgroundSoft">
                <Image
                  source={require("../../assets/images/qr-code.png")}
                  className="h-[96px] w-[96px]"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1">
                <Image
                  source={require("../../assets/images/double-heart.png")}
                  className="mb-2 h-7 w-7 opacity-80"
                  resizeMode="contain"
                />

                <AppText variant="serifSubtitle" className="text-text">
                  QR kod ile fotoğraflarınızı saklayın
                </AppText>

                <AppText variant="body" className="mt-2 text-textMuted">
                  Misafirleriniz anıları kolayca yüklesin ve görüntülesin.
                </AppText>
              </View>
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
