import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

const suggestions = [
  "En az 8 karakter kullanın",
  "Büyük ve küçük harf kullanın",
  "En az bir rakam ekleyin",
  "Özel karakter kullanın (!@#$%^&*)",
];

export function PasswordSuggestions() {
  return (
    <View className="mt-6 flex-row gap-4 rounded-xl bg-primarySoft px-4 py-5">
      <View className="h-14 w-14 items-center justify-center rounded-[24px] bg-primaryLight">
        <Ionicons
          name="shield-checkmark-outline"
          size={30}
          color={Colors.accent}
        />
      </View>

      <View className="flex-1">
        <AppText variant="captionStrong" className="text-[14px]">
          Güçlü şifre için öneriler
        </AppText>

        <View className="mt-2 gap-2">
          {suggestions.map((item) => (
            <View key={item} className="flex-row items-center gap-2">
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={Colors.accent}
              />
              <AppText variant="body">{item}</AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
