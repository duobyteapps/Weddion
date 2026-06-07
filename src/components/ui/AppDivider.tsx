// src/components/ui/AppDivider.tsx
import { View } from "react-native";

type AppDividerProps = {
  className?: string;
};

export function AppDivider({ className = "" }: AppDividerProps) {
  return <View className={`h-[1px] bg-borderSoft ${className}`} />;
}
