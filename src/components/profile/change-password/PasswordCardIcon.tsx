import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Colors } from "@/constants/Colors";

export function PasswordCardIcon() {
  return (
    <View className="h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-primarySoft">
      <Ionicons
        name="lock-closed-outline"
        size={34}
        color={Colors.primaryDark}
      />
    </View>
  );
}
