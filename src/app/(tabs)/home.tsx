// src/app/(tabs)/home.tsx
import { ScrollView, View } from "react-native";

import { DashboardHeader } from "@/components/home/DashboardHeader";
import { HeroCard } from "@/components/home/HeroCard";
import { PromoCard } from "@/components/home/PromoCard";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HomeScreen() {
  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 pt-4">
        <DashboardHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-5"
        >
          <HeroCard />

          <AppText variant="subtitle" className="mb-3 mt-5 text-text">
            Kısayollar
          </AppText>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            <QuickActionCard
              icon="mail"
              title="Davetiyelerim"
              subtitle="3 aktif davetiye"
            />

            <QuickActionCard
              icon="people"
              title="Misafir Listem"
              subtitle="120 misafir"
            />

            <QuickActionCard
              icon="images"
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
