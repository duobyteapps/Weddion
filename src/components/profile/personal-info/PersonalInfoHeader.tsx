import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppText } from "@/components/ui/AppText";
import { router } from "expo-router";
import { View } from "react-native";

export function PersonalInfoHeader() {
  return (
    <View className="relative h-[92px] justify-center">
      <AppBackButton
        onPress={() => router.replace("/(tabs)/profile")}
        className="absolute left-0 z-10"
      />

      <View className="items-center">
        <AppText
          variant="serifTitle"
          className="text-center text-[35px] leading-[42px] text-primary"
        >
          Kişisel Bilgiler
        </AppText>

        <AppText
          variant="body"
          className="mt-1 text-center text-[14px] font-manropeMedium text-textMuted"
        >
          Hesap bilgilerinizi güncelleyin.
        </AppText>
      </View>
    </View>
  );
}
