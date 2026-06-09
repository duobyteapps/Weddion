// src/app/(tabs)/home.tsx
import { ScrollView, View } from "react-native";

import { AppHeader } from "@/components/common/AppHeader";
import { HeroCard } from "@/components/home/HeroCard";
import { PromoCard } from "@/components/home/PromoCard";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HomeScreen() {
  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        <AppHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
        >
          <HeroCard />

          <AppText variant="subtitle" className="mb-3 text-text">
            Kısayollar
          </AppText>

          <View className="w-full flex-row flex-wrap justify-between">
            <QuickActionCard
              icon="mail-outline"
              title="Davetiyelerim"
              subtitle="3 aktif davetiye"
            />

            <QuickActionCard
              icon="people"
              title="Misafir Listem"
              subtitle="120 misafir"
            />

            <QuickActionCard
              icon="images-outline"
              title="Galeri"
              subtitle="45 fotoğraf"
            />

            <QuickActionCard
              icon="calendar"
              title="Etkinlikler"
              subtitle="2 yaklaşan etkinlik"
            />
          </View>

          <PromoCard />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
