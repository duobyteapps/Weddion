import { Image, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type EmptyGalleryNoPhotosProps = {
  onPressShareQrCode: () => void;
};

export function EmptyGalleryNoPhotos({
  onPressShareQrCode,
}: EmptyGalleryNoPhotosProps) {
  return (
    <AppCard className="mt-6 min-h-[420px] items-center justify-center px-6 py-10">
      <Image
        source={require("@/assets/images/illustration/empty-galary.png")}
        className="h-[210px] w-[260px]"
        resizeMode="contain"
      />

      <View className="mt-6 items-center">
        <AppText variant="title" className="text-center">
          Henüz fotoğraf yüklenmemiş
        </AppText>

        <AppText
          variant="body"
          className="mt-3 max-w-[300px] text-center !text-[14px] !leading-[23px]"
        >
          Misafirleriniz fotoğraf yüklediğinde tüm anılar burada görüntülenecek.
        </AppText>
      </View>

      <AppButton
        title="QR Kodunu Paylaş"
        className="mt-8 w-full max-w-[260px]"
        onPress={onPressShareQrCode}
      />
    </AppCard>
  );
}
