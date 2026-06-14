import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  onPressQrCode: () => void;
};

export function GalleryQrInfoCard({ onPressQrCode }: Props) {
  return (
    <AppCard className="!bg-primarySoft">
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="qr-code-outline" size={24} color="#A66AD8" />
        </View>

        <View className="ml-4 flex-1">
          <AppText variant="captionStrong">
            Misafirlerinden gelen fotoğraflar burada.
          </AppText>

          <AppText variant="body" className="mt-1">
            QR kodunla giriş yapan misafirler fotoğraf yükleyebilir.
          </AppText>
        </View>

        <AppButton
          title="QR Kodumu Görüntüle"
          onPress={onPressQrCode}
          className="ml-3 h-10 !px-3"
          textClassName="text-[8px]"
        />
      </View>
    </AppCard>
  );
}
