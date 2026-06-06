import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type QuickActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
}: QuickActionCardProps) {
  return (
    <AppCard className="w-[48%] flex-row items-center px-3 py-4">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primaryLight">
        <Ionicons name={icon} size={23} color="#A875D1" />
      </View>

      <View className="flex-1">
        <AppText
          variant="caption"
          numberOfLines={1}
          className="font-manropeBold text-[13px] text-text"
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          numberOfLines={1}
          className="mt-1 text-[11px] text-textMuted"
        >
          {subtitle}
        </AppText>
      </View>
    </AppCard>
  );
}
