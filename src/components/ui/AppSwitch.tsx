import { Pressable, View } from "react-native";

import { Colors } from "@/constants/Colors";

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function AppSwitch({
  value,
  onValueChange,
  disabled = false,
}: AppSwitchProps) {
  function handlePress() {
    if (disabled) return;

    onValueChange(!value);
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className="h-[22px] w-[42px] justify-center rounded-full px-[2px]"
      style={{
        backgroundColor: value ? Colors.primary : Colors.primarySoft,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <View
        className="h-[18px] w-[18px] rounded-full bg-white"
        style={{
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}
