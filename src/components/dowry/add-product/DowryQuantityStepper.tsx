import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export function DowryQuantityStepper({
  label,
  value,
  onChange,
  min = 1,
}: Props) {
  const decrease = () => {
    if (value <= min) return;

    onChange(value - 1);
  };

  const increase = () => {
    onChange(value + 1);
  };

  return (
    <View className="gap-1.5">
      {label ? (
        <AppText variant="caption" className="text-textMuted">
          {label}
        </AppText>
      ) : null}

      <View className="mb-4 h-12 flex-row overflow-hidden rounded-xl border border-border bg-surfaceLight">
        <Pressable
          className="w-16 items-center justify-center border-r border-border"
          onPress={decrease}
        >
          <MaterialCommunityIcons
            name="minus"
            size={24}
            color={value <= min ? Colors.textLight : Colors.primaryDark}
          />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <AppText variant="subtitle" className="!text-[14px] text-textMuted">
            {value}
          </AppText>
        </View>

        <Pressable
          className="w-16 items-center justify-center border-l border-border"
          onPress={increase}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={Colors.primaryDark}
          />
        </Pressable>
      </View>
    </View>
  );
}
