import { Image, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  imageUrl: string | null;
  onDownloadImagePress: (imageUri: string | null) => void | Promise<void>;
  loading?: boolean;
};

function normalizeImageUri(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  const trimmedImageUrl = imageUrl.trim();

  if (
    trimmedImageUrl.startsWith("data:image") ||
    trimmedImageUrl.startsWith("file://") ||
    trimmedImageUrl.startsWith("http://") ||
    trimmedImageUrl.startsWith("https://") ||
    trimmedImageUrl.startsWith("content://")
  ) {
    return trimmedImageUrl;
  }

  if (trimmedImageUrl.startsWith("/")) {
    return `file://${trimmedImageUrl}`;
  }

  return trimmedImageUrl;
}

export function InvitationShareReadyCard({
  imageUrl,
  onDownloadImagePress,
  loading = false,
}: Props) {
  const normalizedImageUri = normalizeImageUri(imageUrl);

  return (
    <AppCard>
      <View className="flex-row gap-5">
        <View className="w-[40%] overflow-hidden rounded-xl border border-borderSoft bg-background">
          <View className="aspect-[3/4] w-full">
            {normalizedImageUri ? (
              <Image
                source={{ uri: normalizedImageUri }}
                className="h-full w-full"
                resizeMode="cover"
                onError={(error) => {
                  console.log(
                    "Paylaşım küçük görsel yüklenemedi:",
                    error.nativeEvent,
                  );
                  console.log("Ham imageUrl:", imageUrl);
                  console.log("Normalize imageUri:", normalizedImageUri);
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-3">
                <AppText className="text-center text-[10px] text-textMuted">
                  Görsel bulunamadı.
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View className="flex-1 justify-center">
          <AppText variant="subtitle" className="text-primaryDark">
            Davetiyeniz hazır!
          </AppText>

          <AppText className="mt-3 leading-6 text-textMuted">
            Davetiyenizin son hali hazır. Önizleme görseli paylaşım ekranında
            gösteriliyor.
          </AppText>

          <AppButton
            title={loading ? "İndiriliyor..." : "Davetiyeyi İndir"}
            variant="primary"
            onPress={() => onDownloadImagePress(normalizedImageUri)}
            loading={loading}
            disabled={loading || !normalizedImageUri}
            className="mt-5 h-11 rounded-full px-3"
            textClassName="text-[11px]"
          />
        </View>
      </View>
    </AppCard>
  );
}
