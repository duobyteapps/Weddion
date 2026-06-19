// src/app/(tabs)/home.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";

import { AppHeader } from "@/components/common/AppHeader";
import { HeroCard } from "@/components/home/HeroCard";
import { PromoCard } from "@/components/home/PromoCard";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getCurrentUserGuestPhotoCount } from "@/services/guestPhotoService";
import { getCurrentUserInvitationCount } from "@/services/invitationService";

type HomeQuickStats = {
  invitationCount: number;
  galleryPhotoCount: number;
};

function formatInvitationSubtitle(count: number, loading: boolean) {
  if (loading) {
    return "Yükleniyor...";
  }

  return `${count} aktif davetiye`;
}

function formatGallerySubtitle(count: number, loading: boolean) {
  if (loading) {
    return "Yükleniyor...";
  }

  return `${count} fotoğraf`;
}

export default function HomeScreen() {
  const [stats, setStats] = useState<HomeQuickStats>({
    invitationCount: 0,
    galleryPhotoCount: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  const fetchQuickStats = useCallback(async () => {
    try {
      setLoadingStats(true);

      const [invitationCount, galleryPhotoCount] = await Promise.all([
        getCurrentUserInvitationCount(),
        getCurrentUserGuestPhotoCount(),
      ]);

      setStats({
        invitationCount,
        galleryPhotoCount,
      });
    } catch (error) {
      console.log("Home kısayol verileri alınamadı:", error);

      setStats({
        invitationCount: 0,
        galleryPhotoCount: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQuickStats();
    }, [fetchQuickStats]),
  );

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        <AppHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <HeroCard />

          <AppText variant="subtitle" className="mb-3">
            Hızlı İşlemler
          </AppText>

          <View className="w-full flex-row flex-wrap justify-between">
            <QuickActionCard
              icon="mail-outline"
              title="Davetlerim"
              subtitle={formatInvitationSubtitle(
                stats.invitationCount,
                loadingStats,
              )}
              onPress={() => router.push("/(tabs)/my-invitations")}
            />

            <QuickActionCard
              icon="images-outline"
              title="Galeri"
              subtitle={formatGallerySubtitle(
                stats.galleryPhotoCount,
                loadingStats,
              )}
              onPress={() => router.push("/(tabs)/gallery")}
            />

            <QuickActionCard
              icon="calendar"
              title="Etkinliğe Katıl"
              subtitle="QR veya kod ile giriş yap"
              onPress={() => router.push("/guest-photo-access")}
            />

            <QuickActionCard
              icon="gift-outline"
              title="Çeyiz Listesi"
              subtitle="Eşyalarını planla"
              onPress={() => router.push("/(tabs)/dowry-summary")}
            />
          </View>

          <PromoCard />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
