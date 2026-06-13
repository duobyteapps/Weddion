import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";

type Props = {
  onEditPress: () => void;
  onSharePress: () => void;
};

export function InvitationPreviewActions({ onEditPress, onSharePress }: Props) {
  return (
    <View className="flex-row gap-3">
      <AppButton
        title="Düzenlemeye Dön"
        variant="ghost"
        onPress={onEditPress}
        className="flex-1 rounded-xl border-primary px-3"
        textClassName="text-[11px]"
      />

      <AppButton
        title="Paylaşım Adımına Geç"
        variant="primary"
        onPress={onSharePress}
        className="flex-[1.35] rounded-xl px-3"
        textClassName="text-[11px]"
      />
    </View>
  );
}
