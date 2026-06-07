import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

export function PersonalInfoCard() {
  return (
    <AppCard className="mt-8">
      <AppText
        variant="serifSubtitle"
        className="mb-5 text-[25px] text-textDark"
      >
        Kişisel Bilgiler
      </AppText>

      <View className="flex-row gap-3">
        <AppInput
          label="Adınız"
          value="Onur"
          className="flex-1"
          inputClassName="font-manropeBold text-[16px] text-textDark"
        />

        <AppInput
          label="Soyadınız"
          value="Yılmaz"
          className="flex-1"
          inputClassName="font-manropeBold text-[16px] text-textDark"
        />
      </View>

      <AppInput
        label="E-posta Adresiniz"
        value="onur.yilmaz@gmail.com"
        className="mt-4"
        inputClassName="font-manropeBold text-[16px] text-textDark"
      />

      <AppInput
        label="Telefon Numaranız"
        value="+90 555 123 45 67"
        className="mt-4"
        inputClassName="font-manropeBold text-[16px] text-textDark"
      />

      <AppInput
        label="Doğum Tarihiniz"
        value="12.04.1992"
        className="mt-4"
        inputClassName="font-manropeBold text-[16px] text-textDark"
      />
    </AppCard>
  );
}
