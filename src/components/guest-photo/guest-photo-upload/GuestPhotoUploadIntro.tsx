import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export function GuestPhotoUploadIntro() {
  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-2">
        <AppText variant="serifTitle">Anılarınızı paylaşın</AppText>

        <Ionicons name="sparkles" size={25} color="#B88BE6" />
      </View>

      <AppText variant="body">
        Bu özel günden fotoğraflarınızı etkinlik galerisine yükleyin.
      </AppText>
    </View>
  );
}
