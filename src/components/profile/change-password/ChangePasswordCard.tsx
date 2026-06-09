import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppDivider } from "@/components/ui/AppDivider";
import { AppPasswordInput } from "@/components/ui/AppPasswordInput";
import { AppText } from "@/components/ui/AppText";
import { PasswordCardIcon } from "./PasswordCardIcon";
import { PasswordSuggestions } from "./PasswordSuggestions";

type Props = {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
  loading?: boolean;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangeRepeatPassword: (value: string) => void;
  onSubmit: () => void;
};

export function ChangePasswordCard({
  currentPassword,
  newPassword,
  repeatPassword,
  loading = false,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeRepeatPassword,
  onSubmit,
}: Props) {
  return (
    <AppCard className="rounded-[28px] border border-borderSoft bg-surface px-5 py-6">
      <View className="flex-row items-center gap-4">
        <PasswordCardIcon />

        <View className="flex-1">
          <AppText
            variant="serifTitle"
            className="text-[27px] leading-8 text-textDark"
          >
            Yeni şifrenizi oluşturun
          </AppText>

          <AppText className="mt-1 text-[14px] leading-6 text-textMuted">
            Şifreniz en az 8 karakter olmalı ve harf, rakam ve özel karakter
            içermelidir.
          </AppText>
        </View>
      </View>

      <AppDivider className="my-6 bg-borderSoft" />

      <AppPasswordInput
        label="Mevcut Şifre"
        placeholder="Mevcut şifrenizi girin"
        value={currentPassword}
        onChangeText={onChangeCurrentPassword}
      />

      <AppPasswordInput
        label="Yeni Şifre"
        placeholder="Yeni şifrenizi girin"
        value={newPassword}
        onChangeText={onChangeNewPassword}
        className="mt-4"
      />

      <AppPasswordInput
        label="Yeni Şifre (Tekrar)"
        placeholder="Yeni şifrenizi tekrar girin"
        value={repeatPassword}
        onChangeText={onChangeRepeatPassword}
        className="mt-4"
      />

      <PasswordSuggestions />

      <AppButton
        title={loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
        loading={loading}
        onPress={onSubmit}
        className="mt-7"
      />
    </AppCard>
  );
}
