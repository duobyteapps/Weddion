import { View } from "react-native";

import { AppLogo } from "@/components/ui/AppLogo";
import { AppText } from "@/components/ui/AppText";

export function AuthHeader() {
  return (
    <View className="items-center">
      <AppLogo size="lg" />

      <AppText variant="caption" className="mt-1 text-center text-textMuted">
        Özel anlar, unutulmaz davetiyeler
      </AppText>
    </View>
  );
}
