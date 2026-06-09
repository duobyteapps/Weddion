import { View } from "react-native";

import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppText } from "@/components/ui/AppText";

type Props = {
  onBackPress: () => void;
};

export function ChangePasswordHeader({ onBackPress }: Props) {
  return (
    <View className="relative items-center px-2">
      <AppBackButton
        onPress={onBackPress}
        className="absolute left-0 top-0 z-10"
      />

      <AppText
        variant="serifTitle"
        className="text-center text-[38px] leading-[44px] text-primary"
      >
        Şifre Değiştir
      </AppText>

      <AppText className="mt-2 text-center text-[15px] leading-6 text-textMuted">
        Hesabınızın güvenliği için güçlü bir şifre belirleyin.
      </AppText>
    </View>
  );
}
