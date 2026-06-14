import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type Props = {
  onCameraPress?: () => void;
  onGalleryPress?: () => void;
};

export function GuestPhotoSourceActions({
  onCameraPress,
  onGalleryPress,
}: Props) {
  return (
    <View className="mb-3 flex-row gap-3">
      <Pressable className="flex-1 active:opacity-80" onPress={onCameraPress}>
        <AppCard noMargin noPadding className="py-4 !px-3 !border">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primarySoft">
              <Ionicons
                name="camera-outline"
                size={16}
                color={Colors.primary}
              />
            </View>

            <View className="flex-1">
              <AppText variant="captionStrong">Kamera ile çek</AppText>
              <AppText variant="body">Anında fotoğraf çek</AppText>
            </View>
          </View>
        </AppCard>
      </Pressable>

      <Pressable className="flex-1 active:opacity-80" onPress={onGalleryPress}>
        <AppCard noMargin noPadding className="py-4 !px-3 !border">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primarySoft">
              <Ionicons
                name="images-outline"
                size={18}
                color={Colors.primary}
              />
            </View>

            <View className="flex-1">
              <AppText variant="captionStrong">Galeriden seç</AppText>
              <AppText variant="body">Cihazınızdan seçin</AppText>
            </View>
          </View>
        </AppCard>
      </Pressable>
    </View>
  );
}
