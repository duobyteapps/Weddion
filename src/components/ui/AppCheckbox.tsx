import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, type PressableProps } from "react-native";

import { Colors } from "@/constants/Colors";

type Props = Omit<PressableProps, "style"> & {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  rounded?: "full" | "md";
};

export function AppCheckbox({
  checked,
  onChange,
  rounded = "full",
  disabled = false,
  onPress,
  ...props
}: Props) {
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-md";

  const handlePress: PressableProps["onPress"] = (event) => {
    if (disabled) return;

    onChange?.(!checked);
    onPress?.(event);
  };

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={handlePress}
      className={`mr-3 h-6 w-6 items-center justify-center border-2 ${
        checked ? "border-primary bg-primary" : "border-primaryLight bg-white"
      } ${roundedClass} ${disabled ? "opacity-50" : ""}`}
    >
      {checked ? (
        <MaterialCommunityIcons name="check" size={14} color={Colors.white} />
      ) : null}
    </Pressable>
  );
}
