import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export function SectionInfoHeader({ iconName, title, description }: Props) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-accentLight">
        <Ionicons name={iconName} size={24} color={Colors.accent} />
      </View>

      <View className="flex-1">
        <AppText variant="serifTitle" className="mb-1">
          {title}
        </AppText>

        <AppText variant="body">{description}</AppText>
      </View>
    </View>
  );
}
