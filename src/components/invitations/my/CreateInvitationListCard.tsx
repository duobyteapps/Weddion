import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  onPress: () => void;
};

export function CreateInvitationListCard({ onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <AppCard noMargin noPadding className="mb-6 py-4">
        <View className="flex-row items-center gap-4">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primarySoft">
            <Ionicons name="add" size={24} color={Colors.primary} />
          </View>

          <View className="flex-1">
            <AppText variant="captionStrong" className="mb-1">
              Yeni Davetiye Oluştur
            </AppText>

            <AppText variant="caption" className="!text-[10px]">
              Yeni bir davetiye tasarlamaya başlayın.
            </AppText>
          </View>

          <View className="h-9 w-9 items-center justify-center rounded-full bg-primarySoft/60">
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
