import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
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
  onDownloadQrPress?: (qrImageUri: string) => void | Promise<void>;
  qrDownloadLoading?: boolean;
};

type QRCodeRef = {
  toDataURL: (callback: (data: string) => void) => void;
};

export function InvitationQrShareCard({
  qrValue,
  guestUploadCode,
  onCopyCodePress,
  onCopyLinkPress,
  onDownloadQrPress,
  qrDownloadLoading = false,
}: Props) {
  const qrRef = useRef<QRCodeRef | null>(null);

  function handleDownloadQrPress() {
    if (!onDownloadQrPress || !qrRef.current) {
      return;
    }

    qrRef.current.toDataURL((data) => {
      const qrImageUri = `data:image/png;base64,${data}`;

      void onDownloadQrPress(qrImageUri);
    });
  }

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
          <QRCode
            value={qrValue}
            size={190}
            backgroundColor="#FFFFFF"
            color="#111827"
            getRef={(ref) => {
              qrRef.current = ref as QRCodeRef;
            }}
          />
        </View>

        {guestUploadCode ? (
          <View className="w-full gap-2 rounded-xl bg-slate-50 p-4">
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

      {onDownloadQrPress ? (
        <AppButton
          title={qrDownloadLoading ? "QR İndiriliyor..." : "QR Kodunu İndir"}
          variant="primary"
          onPress={handleDownloadQrPress}
          loading={qrDownloadLoading}
          disabled={qrDownloadLoading}
        />
      ) : null}
    </AppCard>
  );
}
