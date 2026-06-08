import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

export function ChangePasswordHeader() {
  return (
    <View className="mb-10 flex-row items-start">
      <Pressable
        onPress={() => router.back()}
        className="mt-3 h-10 w-10 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={32} color={Colors.textLight} />
      </Pressable>

      <View className="flex-1 items-center pr-10">
        <AppText
          variant="title"
          className="text-center text-[34px] text-textDark"
        >
          Şifre ve Güvenlik
        </AppText>

        <AppText variant="body" className="mt-1 text-center text-textMuted">
          Hesap şifrenizi güncelleyin.
        </AppText>
      </View>
    </View>
  );
}
