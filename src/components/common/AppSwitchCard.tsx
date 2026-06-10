// components/ui/AppSwitchCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppSwitch } from "@/components/ui/AppSwitch";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AppSwitchCard({
  title,
  description,
  value,
  onValueChange,
  icon = "notifications",
}: Props) {
  return (
    <AppCard noMargin noPadding className="mb-3 py-4">
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primarySoft">
          <Ionicons name={icon} size={18} color={Colors.primary} />
        </View>

        <View className="flex-1">
          <AppText variant="captionStrong" className="mb-1">
            {title}
          </AppText>

          <AppText variant="caption">{description}</AppText>
        </View>

        <AppSwitch value={value} onValueChange={onValueChange} />
      </View>
    </AppCard>
  );
}
