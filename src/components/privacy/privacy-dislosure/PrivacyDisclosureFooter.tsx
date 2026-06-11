import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export function PrivacyDisclosureFooter() {
  return (
    <AppCard className="flex-row items-center gap-4 my-2">
      <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-primarySoft">
        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
      </View>

      <View>
        <AppText variant="body" className="!text-text">
          Son Güncelleme
        </AppText>
        <AppText variant="body">20 Mayıs 2026</AppText>
      </View>
    </AppCard>
  );
}
