import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  qrValue: string;
  onCopyLinkPress?: () => void;
  onDownloadQrPress?: () => void;
};

export function InvitationQrShareCard({
  qrValue,
  onCopyLinkPress,
  onDownloadQrPress,
}: Props) {
  return (
    <AppCard className="mt-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <AppText variant="subtitle" className="text-textDark">
            QR Kod ile Fotoğraf Topla
          </AppText>

          <AppText className="mt-2 leading-6 text-textMuted">
            Davetliler bu QR kodu okutarak düğün, nişan veya kına fotoğraflarını
            uygulama üzerinden yükleyebilir.
          </AppText>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-primarySoft">
          <Ionicons name="qr-code-outline" size={24} color="#8F5DB9" />
        </View>
      </View>

      <View className="mt-5 flex-row items-center gap-5 rounded-3xl bg-background p-4">
        <View className="items-center justify-center rounded-2xl bg-surface p-3">
          <QRCode value={qrValue} size={118} />
        </View>

        <View className="flex-1">
          <AppText variant="captionStrong" className="text-textDark">
            Fotoğraf yükleme bağlantısı
          </AppText>

          <View className="mt-3 rounded-2xl border border-border bg-surface px-4 py-3">
            <AppText
              variant="caption"
              numberOfLines={2}
              className="text-textMuted"
            >
              {qrValue}
            </AppText>
          </View>

          <View className="mt-4 flex-row gap-2">
            <AppButton
              title="Kopyala"
              variant="ghost"
              onPress={onCopyLinkPress}
              className="h-10 flex-1 rounded-full border-primary px-3"
              textClassName="text-primaryDark text-[12px]"
            />

            <AppButton
              title="QR İndir"
              variant="secondary"
              onPress={onDownloadQrPress}
              className="h-10 flex-1 rounded-full px-3"
              textClassName="text-primaryDark text-[12px]"
            />
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-2xl bg-primarySoft px-4 py-3">
        <AppText className="leading-5 text-textMuted">
          Not: Web sitesi olmadığı için bu bağlantı uygulama içi yönlendirme
          olarak çalışır. Davetlilerin fotoğraf yükleyebilmesi için uygulamada
          ilgili fotoğraf yükleme ekranı bulunmalıdır.
        </AppText>
      </View>
    </AppCard>
  );
}
