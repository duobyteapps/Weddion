import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type QuickActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  className?: string;
  onPress?: () => void;
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
  className = "",
  onPress,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      className={`w-[48%] ${className}`}
    >
      <AppCard noMargin className="mb-4 flex-row items-center border-0">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-primaryLight">
          <Ionicons name={icon} size={20} color="#A875D1" />
        </View>

        <View className="flex-1">
          <AppText
            variant="serifSubtitle"
            numberOfLines={1}
            className="!text-[14px]"
          >
            {title}
          </AppText>

          <AppText variant="caption" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}
