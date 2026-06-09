import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

const suggestions = [
  "En az 8 karakter kullanın",
  "Büyük ve küçük harf kullanın",
  "En az bir rakam ekleyin",
  "Özel karakter kullanın (!@#$%^&*)",
];

export function PasswordSuggestions() {
  return (
    <View className="mt-6 flex-row gap-4 rounded-[24px] bg-primaryLight px-4 py-5">
      <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white/60">
        <Ionicons name="shield-checkmark-outline" size={34} color="#9B5DD6" />
      </View>

      <View className="flex-1">
        <AppText className="font-manropeBold text-[15px] text-primary">
          Güçlü şifre için öneriler
        </AppText>

        <View className="mt-2 gap-2">
          {suggestions.map((item) => (
            <View key={item} className="flex-row items-center gap-2">
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#9B5DD6"
              />
              <AppText className="text-[13px] leading-5 text-textMuted">
                {item}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
