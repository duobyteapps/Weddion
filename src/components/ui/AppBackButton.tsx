import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";

type AppBackButtonProps = {
  onPress: () => void;
  className?: string;
};

export function AppBackButton({ onPress, className = "" }: AppBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={`h-11 w-11 items-center justify-center rounded-full ${className}`}
    >
      <Feather name="chevron-left" size={32} color="#18214D" />
    </Pressable>
  );
}
