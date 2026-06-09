import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

export function SecurityInfoCard() {
  return (
    <View className="mt-7 flex-row gap-4 px-4">
      <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-primaryLight">
        <Ionicons name="shield-checkmark-outline" size={30} color="#9B5DD6" />
      </View>

      <View className="flex-1">
        <AppText className="font-manropeBold text-[16px] text-primaryDark">
          Güvenliğiniz bizim için önemli
        </AppText>

        <AppText className="mt-1 text-[14px] leading-6 text-textMuted">
          Şifreniz güncellendikten sonra tüm cihazlarda yeniden oturum açmanız
          gerekebilir.
        </AppText>
      </View>
    </View>
  );
}
