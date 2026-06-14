import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Props = {
  className?: string;
};

export function GuestPhotoPrivacyNotice({ className = "" }: Props) {
  return (
    <AppCard
      noPadding
      className={`flex-row items-center !bg-primarySoft py-2 !px-4 ${className}`}
    >
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-primaryLight">
        <Ionicons name="shield-checkmark-outline" size={21} color="#9B6BD3" />
      </View>

      <AppText variant="body" className="flex-1">
        Yüklediğiniz fotoğraflar sadece etkinlik sahipleri ve davetliler
        tarafından görüntülenebilir.
      </AppText>
    </AppCard>
  );
}
