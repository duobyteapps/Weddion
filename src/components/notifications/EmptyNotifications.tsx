import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

export function EmptyNotifications() {
  return (
    <View className="mt-10 items-center rounded-3xl bg-white px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primarySoft">
        <Ionicons
          name="notifications-outline"
          size={30}
          color={Colors.primary}
        />
      </View>

      <AppText variant="serifTitle" className="text-center text-textDark">
        Henüz bildiriminiz yok
      </AppText>

      <AppText className="mt-2 text-center text-[14px] leading-5 text-textMuted">
        Davetlerinize yeni fotoğraf geldiğinde burada görünecek.
      </AppText>
    </View>
  );
}
