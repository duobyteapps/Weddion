import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

export function InvitationPreviewSuccessCard() {
  return (
    <AppCard noMargin noPadding className="mb-6 py-4">
      <View className="flex-row items-center gap-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primarySoft">
          <Ionicons name="heart-outline" size={20} color={Colors.primary} />
        </View>

        <View className="flex-1">
          <AppText variant="captionStrong" className="mb-1">
            Harika görünüyor!
          </AppText>

          <AppText variant="caption" className="!text-[10px]">
            Davetiyeniz hazır. Şimdi paylaşım adımına geçebilirsiniz.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
