import { TextInput } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  inviteCode: string;
  joining: boolean;
  disabled?: boolean;
  onInviteCodeChange: (value: string) => void;
  onJoin: () => void;
};

export function DowryJoinAccountCard({
  inviteCode,
  joining,
  disabled = false,
  onInviteCodeChange,
  onJoin,
}: Props) {
  const inputValue = disabled ? "Zaten ortak çeyiz hesabındasın" : inviteCode;

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
        value={inputValue}
        editable={!disabled}
        pointerEvents={disabled ? "none" : "auto"}
        onChangeText={(value) => {
          if (!disabled) {
            onInviteCodeChange(value.toUpperCase());
          }
        }}
        placeholder="Davet kodu"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="characters"
        className={`mb-3 rounded-2xl border border-border bg-white px-4 py-3 font-manropeSemiBold text-[16px] text-textDark ${
          disabled ? "tracking-normal opacity-60" : "tracking-[4px]"
        }`}
      />

      <AppButton
        title="Çeyiz Hesabına Katıl"
        loading={joining}
        disabled={disabled}
        onPress={onJoin}
      />
    </AppCard>
  );
}
