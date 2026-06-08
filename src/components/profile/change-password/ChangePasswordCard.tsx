import { AppCard } from "@/components/ui/AppCard";
import { AppPasswordInput } from "@/components/ui/AppPasswordInput";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Props = {
  password: string;
  passwordAgain: string;
  onChangePassword: (value: string) => void;
  onChangePasswordAgain: (value: string) => void;
};

export function ChangePasswordCard({
  password,
  passwordAgain,
  onChangePassword,
  onChangePasswordAgain,
}: Props) {
  return (
    <AppCard className="rounded-[26px] px-5 py-7">
      <View className="mb-7 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primarySoft">
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color={Colors.primary}
          />
        </View>

        <View>
          <AppText variant="title" className="text-[34px] text-textDark">
            Şifre Değiştir
          </AppText>

          <AppText variant="caption" className="mt-1 text-textMuted">
            Yeni şifrenizi belirleyin.
          </AppText>
        </View>
      </View>

      <View className="gap-5">
        <AppPasswordInput
          label="Yeni Şifre"
          value={password}
          onChangeText={onChangePassword}
          placeholder="Yeni şifrenizi yazın"
        />

        <AppPasswordInput
          label="Yeni Şifre Tekrar"
          value={passwordAgain}
          onChangeText={onChangePasswordAgain}
          placeholder="Yeni şifrenizi tekrar yazın"
        />
      </View>
    </AppCard>
  );
}
