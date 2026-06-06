import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AppBackButtonProps = {
  onPress: () => void;
  className?: string;
};

export function AppBackButton({ onPress, className = "" }: AppBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-4 h-11 w-11 items-center justify-center rounded-full ${className}`}
    >
      <AppText className="font-manropeBold text-[38px] leading-[40px] text-text">
        ‹
      </AppText>
    </Pressable>
  );
}
