import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppText } from "@/components/ui/AppText";
import { router } from "expo-router";
import { View } from "react-native";

export function ChangePasswordHeader() {
  return (
    <View className="relative justify-center">
      <AppBackButton
        onPress={() => router.replace("/(tabs)/profile")}
        className="absolute left-0 z-10"
      />
      <View className="items-center">
        <AppText variant="serifTitle" className="">
          Şifre Değiştir
        </AppText>

        <AppText variant="body">
          Hesabınızın güvenliği için güçlü bir şifre belirleyin.
        </AppText>
      </View>
    </View>
  );
}
