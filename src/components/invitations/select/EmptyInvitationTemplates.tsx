import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

export function EmptyInvitationTemplates() {
  return (
    <View className="items-center justify-center py-16">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primarySoft">
        <Ionicons name="images-outline" size={24} color="#7C3AED" />
      </View>

      <AppText variant="serifTitle" className="text-center">
        Davetiye Bulunamadı
      </AppText>

      <AppText variant="caption" className="mt-2 text-center text-textSoft">
        Bu kategori için henüz davetiye eklenmemiş.
      </AppText>
    </View>
  );
}
