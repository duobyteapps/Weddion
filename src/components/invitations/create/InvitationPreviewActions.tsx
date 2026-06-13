import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";

type Props = {
  onEditPress: () => void;
  onSharePress: () => void;
  shareLoading?: boolean;
  disabled?: boolean;
};

export function InvitationPreviewActions({
  onEditPress,
  onSharePress,
  shareLoading = false,
  disabled = false,
}: Props) {
  return (
    <View className="flex-row gap-3">
      <AppButton
        title="Düzenlemeye Dön"
        variant="ghost"
        onPress={onEditPress}
        disabled={disabled}
        className="flex-1 rounded-xl border-primary px-3"
        textClassName="text-[11px]"
      />

      <AppButton
        title={shareLoading ? "Kaydediliyor..." : "Kaydet ve Paylaş"}
        variant="primary"
        onPress={onSharePress}
        loading={shareLoading}
        disabled={disabled}
        className="flex-[1.35] rounded-xl px-3"
        textClassName="text-[11px]"
      />
    </View>
  );
}
