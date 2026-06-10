import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

export function SecurityInfoCard() {
  return (
    <View className="mt-7 flex-row gap-4 px-4">
      <View className="h-14 w-14 items-center justify-center rounded-[24px] bg-primaryLight">
        <Ionicons
          name="shield-checkmark-outline"
          size={30}
          color={Colors.accent}
        />
      </View>

      <View className="flex-1">
        <AppText variant="captionStrong" className="text-[14px] mb-2">
          Güvenliğiniz bizim için önemli
        </AppText>

        <AppText variant="body">
          Şifreniz güncellendikten sonra tüm cihazlarda yeniden oturum açmanız
          gerekebilir.
        </AppText>
      </View>
    </View>
  );
}
