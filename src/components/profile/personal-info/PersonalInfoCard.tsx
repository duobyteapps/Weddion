import { AppCard } from "@/components/ui/AppCard";
import { AppDateInput } from "@/components/ui/AppDateInput";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeBirthDate: (value: string) => void;
};

export function PersonalInfoCard({
  firstName,
  lastName,
  email,
  phone,
  birthDate,
  onChangeFirstName,
  onChangeLastName,
  onChangePhone,
  onChangeBirthDate,
}: Props) {
  return (
    <AppCard>
      <AppText variant="serifTitle" className="mb-3">
        Kişisel Bilgiler
      </AppText>

      <View className="flex-row gap-3">
        <AppInput
          label="Adınız"
          value={firstName}
          onChangeText={onChangeFirstName}
          className="flex-1"
        />

        <AppInput
          label="Soyadınız"
          value={lastName}
          onChangeText={onChangeLastName}
          className="flex-1"
        />
      </View>

      <AppInput
        label="E-posta Adresiniz"
        value={email}
        editable={false}
        className="mt-4 opacity-70"
      />

      <AppInput
        label="Telefon Numaranız"
        value={phone}
        onChangeText={onChangePhone}
        keyboardType="phone-pad"
        className="mt-4"
      />

      <AppDateInput
        label="Doğum Tarihiniz"
        value={birthDate}
        placeholder="Doğum tarihinizi seçin"
        maximumDate={new Date()}
        onChange={onChangeBirthDate}
      />
    </AppCard>
  );
}
