import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { DowryCategoryItem } from "@/types/dowry";

type DowryCategoryRowProps = {
  category: DowryCategoryItem;
  onPress?: (category: DowryCategoryItem) => void;
};

export function DowryCategoryRow({ category, onPress }: DowryCategoryRowProps) {
  const percentage =
    category.total > 0
      ? Math.min((category.completed / category.total) * 100, 100)
      : 0;

  return (
    <Pressable
      className="flex-row items-center py-2"
      onPress={() => onPress?.(category)}
    >
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-primarySoft">
        <MaterialCommunityIcons
          name={category.icon}
          size={16}
          color={Colors.primary}
        />
      </View>

      <AppText
        variant="serifSubtitle"
        numberOfLines={1}
        className="ml-3 w-[108px] !text-[14px]"
      >
        {category.title}
      </AppText>

      <View className="ml-2 h-[6px] w-[100px] overflow-hidden rounded-full bg-primarySoft">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </View>

      <AppText
        variant="caption"
        className="ml-1 w-[50px] text-right text-textMuted"
      >
        {category.completed} / {category.total}
      </AppText>

      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={Colors.textMuted}
      />
    </Pressable>
  );
}
