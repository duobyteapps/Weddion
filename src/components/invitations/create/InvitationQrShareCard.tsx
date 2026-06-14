import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  qrValue: string;
  guestUploadCode?: string | null;
  onCopyCodePress?: () => void;
  onCopyLinkPress?: () => void;
  onDownloadQrPress?: () => void;
};

export function InvitationQrShareCard({
  qrValue,
  guestUploadCode,
  onCopyCodePress,
  onCopyLinkPress,
  onDownloadQrPress,
}: Props) {
  return (
    <AppCard className="gap-5">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <Ionicons name="qr-code-outline" size={22} color="#7C3AED" />
        </View>

        <View className="flex-1 gap-1">
          <AppText className="text-lg font-semibold text-slate-900">
            QR Kod ile Fotoğraf Topla
          </AppText>

          <AppText className="text-sm leading-5 text-slate-500">
            Davetliler QR kodu okutarak veya aşağıdaki davet kodunu girerek
            giriş yapmadan fotoğraf yükleyebilir.
          </AppText>
        </View>
      </View>

      <View className="items-center gap-4">
        <View className="rounded-3xl bg-white p-4">
          <QRCode value={qrValue} size={190} />
        </View>

        {guestUploadCode ? (
          <View className="w-full gap-2 rounded-3xl bg-slate-50 p-4">
            <AppText className="text-center text-xs font-medium uppercase tracking-[2px] text-slate-400">
              Davet Kodu
            </AppText>

            <AppText className="text-center text-2xl font-bold tracking-[3px] text-slate-900">
              {guestUploadCode}
            </AppText>

            <AppText className="text-center text-xs leading-5 text-slate-500">
              QR kullanamayan davetliler bu kodu girerek fotoğraf yükleyebilir.
            </AppText>

            {onCopyCodePress ? (
              <AppButton
                title="Kodu Kopyala"
                variant="ghost"
                onPress={onCopyCodePress}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="gap-2 rounded-2xl bg-violet-50 p-4">
        <AppText className="text-sm font-semibold text-violet-900">
          Fotoğraf yükleme bağlantısı
        </AppText>

        <AppText className="text-xs leading-5 text-violet-700">
          {qrValue}
        </AppText>
      </View>

      <View className="gap-3">
        {onCopyLinkPress ? (
          <AppButton
            title="Bağlantıyı Kopyala"
            variant="ghost"
            onPress={onCopyLinkPress}
          />
        ) : null}

        {onDownloadQrPress ? (
          <AppButton
            title="QR Kodunu İndir"
            variant="primary"
            onPress={onDownloadQrPress}
          />
        ) : null}
      </View>

      <View className="flex-row gap-2 rounded-2xl bg-amber-50 p-3">
        <Ionicons name="information-circle-outline" size={18} color="#B45309" />
        <AppText className="flex-1 text-xs leading-5 text-amber-700">
          Şu an QR değeri uygulama içi yönlendirme olarak hazırlanır. Web domain
          bağlanınca aynı alanı web linkine çevirebiliriz.
        </AppText>
      </View>
    </AppCard>
  );
}
