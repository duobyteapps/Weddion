import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onChangePhone: (value: string) => void;
};

export function PersonalInfoCard({
  firstName,
  lastName,
  email,
  phone,
  onChangeFirstName,
  onChangeLastName,
  onChangePhone,
}: Props) {
  return (
    <AppCard className="mt-5">
      <AppText variant="title" className="text-textDark">
        Kişisel Bilgiler
      </AppText>

      <View className="mt-4 gap-4">
        <AppInput
          label="Ad"
          value={firstName}
          onChangeText={onChangeFirstName}
          placeholder="Adınızı girin"
        />

        <AppInput
          label="Soyad"
          value={lastName}
          onChangeText={onChangeLastName}
          placeholder="Soyadınızı girin"
        />

        <AppInput
          label="E-posta"
          value={email}
          editable={false}
          placeholder="E-posta adresiniz"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Telefon"
          value={phone}
          onChangeText={onChangePhone}
          placeholder="Telefon numaranızı girin"
          keyboardType="phone-pad"
        />
      </View>
    </AppCard>
  );
}
