import { TextInput } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type Props = {
  shouldShowJoinCard: boolean;
  hasPartner: boolean;
  isPartner: boolean;
  joinCode: string;
  joining: boolean;
  onChangeJoinCode: (value: string) => void;
  onJoinGallery: () => void;
};

export function GalleryJoinGalleryCard({
  shouldShowJoinCard,
  hasPartner,
  isPartner,
  joinCode,
  joining,
  onChangeJoinCode,
  onJoinGallery,
}: Props) {
  if (!shouldShowJoinCard) {
    return null;
  }

  const disabled = hasPartner || isPartner;
  const inputValue = disabled ? "Zaten ortak galeri hesabındasın" : joinCode;

  return (
    <AppCard>
      <AppText variant="subtitle" className="mb-2 text-textDark">
        Davet Kodu ile Katıl
      </AppText>

      <AppText variant="body" className="mb-4">
        Sana verilen davet kodunu girerek aynı galeriye katılabilirsin.
      </AppText>

      <TextInput
        value={inputValue}
        editable={!disabled}
        pointerEvents={disabled ? "none" : "auto"}
        onChangeText={(value) => {
          if (!disabled) {
            onChangeJoinCode(value.toUpperCase());
          }
        }}
        placeholder="Davet kodu"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        className={`mb-3 rounded-2xl border border-border bg-white px-4 py-3 font-manropeSemiBold text-[16px] text-textDark ${
          disabled ? "tracking-normal opacity-60" : "tracking-[4px]"
        }`}
      />

      <AppButton
        title="Galeri Hesabına Katıl"
        loading={joining}
        disabled={disabled}
        onPress={onJoinGallery}
      />
    </AppCard>
  );
}
