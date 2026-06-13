import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function InvitationShareNoteCard() {
  return (
    <AppCard className="mt-5">
      <View className="flex-row">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primarySoft">
          <Ionicons
            name="information-circle-outline"
            size={28}
            color="#8F5DB9"
          />
        </View>

        <View className="flex-1">
          <AppText variant="subtitle" className="text-textDark">
            Not
          </AppText>

          <AppText className="mt-1 leading-5 text-textMuted">
            Davetiyenizi Instagram’da paylaşabilir, QR kodu ise davetlilerden
            fotoğraf toplamak için kullanabilirsiniz.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
