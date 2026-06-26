import { TextInput } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  inviteCode: string;
  joining: boolean;
  onInviteCodeChange: (value: string) => void;
  onJoin: () => void;
};

export function DowryJoinAccountCard({
  inviteCode,
  joining,
  onInviteCodeChange,
  onJoin,
}: Props) {
  return (
    <AppCard>
      <AppText variant="subtitle" className="mb-2 text-textDark">
        Davet Kodu ile Katıl
      </AppText>

      <AppText variant="body" className="mb-4">
        Nişanlının sana verdiği davet kodunu girerek aynı çeyiz hesabına
        katılabilirsin.
      </AppText>

      <TextInput
        value={inviteCode}
        onChangeText={(value) => onInviteCodeChange(value.toUpperCase())}
        placeholder="Davet kodu"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="characters"
        className="mb-3 rounded-2xl border border-border bg-white px-4 py-3 font-manropeSemiBold text-[16px] tracking-[4px] text-textDark"
      />

      <AppButton
        title="Çeyiz Hesabına Katıl"
        loading={joining}
        onPress={onJoin}
      />
    </AppCard>
  );
}
