import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type QuickActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  className?: string;
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
  className = "",
}: QuickActionCardProps) {
  return (
    <AppCard className={`w-[48%] min-h-[80px] flex-row items-center border-0`}>
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primaryLight">
        <Ionicons name={icon} size={23} color="#A875D1" />
      </View>

      <View className="flex-1">
        <AppText
          variant="body"
          numberOfLines={1}
          className="font-manropeBold text-text"
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          numberOfLines={1}
          className="mt-1 text-textMuted"
        >
          {subtitle}
        </AppText>
      </View>
    </AppCard>
  );
}
