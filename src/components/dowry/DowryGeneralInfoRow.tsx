import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type DowryGeneralInfoRowProps = {
  icon: MaterialIconName;
  label: string;
  value: number;
  iconColor?: string;
  iconBackground?: string;
};

const PURPLE = "#8F6BC8";
const PURPLE_SOFT = "#F0EAF8";

export function DowryGeneralInfoRow({
  icon,
  label,
  value,
  iconColor = PURPLE,
  iconBackground = PURPLE_SOFT,
}: DowryGeneralInfoRowProps) {
  return (
    <View className="flex-row items-center gap-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBackground }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>

      <View>
        <AppText variant="body">{label}</AppText>
        <AppText variant="subtitle">{value}</AppText>
      </View>
    </View>
  );
}
