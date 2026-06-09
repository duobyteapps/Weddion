// src/components/profile/ProfileEventCard.tsx
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import { AppCard } from "../ui/AppCard";

export function ProfileEventCard() {
  return (
    <AppCard>
      <View className="mb-5 flex-row items-center justify-between">
        <AppText variant="serifTitle" className="text-textDark">
          Etkinliklerim
        </AppText>

        <View className="flex-row items-center">
          <AppText variant="captionStrong" className="mr-2 text-primary">
            Tümünü Gör
          </AppText>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>

      <View className="flex-row items-center">
        <Image
          source={require("@/assets/images/lavender-wedding-invitation.png")}
          className="h-24 w-24 rounded-2xl"
          resizeMode="cover"
        />

        <View className="ml-3 flex-1">
          <AppText variant="serifSubtitle" className="text-textDark">
            Nisa & Onur Düğünü
          </AppText>

          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="calendar-outline"
              size={19}
              color={Colors.textLight}
            />
            <AppText className="ml-2 text-textMuted">22 Ağustos 2026</AppText>
          </View>

          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={19}
              color={Colors.textLight}
            />
            <AppText className="ml-2 text-textMuted">Samsun</AppText>
          </View>
        </View>

        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full border-[9px] border-primary">
            <AppText variant="serifSubtitle" className="text-textDark">
              %67
            </AppText>
          </View>

          <AppText className="mt-2 text-[13px] text-textMuted">
            Katılım Oranı
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
