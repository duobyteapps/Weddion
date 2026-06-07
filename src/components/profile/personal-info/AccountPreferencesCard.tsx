import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Switch, View } from "react-native";

type PreferenceRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

function PreferenceRow({ icon, title, description }: PreferenceRowProps) {
  return (
    <View className="flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primarySoft">
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>

      <View className="ml-4 flex-1">
        <AppText className="font-manropeBold text-[15px] text-textDark">
          {title}
        </AppText>

        <AppText className="mt-1 text-[13px] text-textMuted">
          {description}
        </AppText>
      </View>

      <Switch
        value
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

export function AccountPreferencesCard() {
  return (
    <AppCard className="mt-6">
      <AppText
        variant="serifSubtitle"
        className="mb-5 text-[25px] text-textDark"
      >
        Hesap Tercihleri
      </AppText>

      <PreferenceRow
        icon="notifications-outline"
        title="E-posta Bildirimleri"
        description="Etkinlikler ve güncellemeler hakkında bilgilendiril."
      />

      <View className="h-3" />

      <PreferenceRow
        icon="chatbox-ellipses-outline"
        title="SMS Bildirimleri"
        description="Önemli hatırlatmalar için SMS al."
      />
    </AppCard>
  );
}
