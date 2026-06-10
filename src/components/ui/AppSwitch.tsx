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
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange(!value)}
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
          shadowColor: Colors.primaryDark,
          shadowOpacity: 0.15,
          shadowRadius: 5,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
