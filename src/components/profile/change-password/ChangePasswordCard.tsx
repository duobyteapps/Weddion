import { SectionInfoHeader } from "@/components/common/SectionInfoHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppDivider } from "@/components/ui/AppDivider";
import { AppPasswordInput } from "@/components/ui/AppPasswordInput";
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
    <AppCard>
      <SectionInfoHeader
        iconName="lock-closed-outline"
        title="Yeni şifrenizi oluşturun"
        description="Şifreniz en az 8 karakter olmalı ve harf, rakam ve özel karakter içermelidir."
      />

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
