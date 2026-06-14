import { AppCard } from "@/components/ui/AppCard";
import { AppDivider } from "@/components/ui/AppDivider";
import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { GuestPhotoSelectedCard } from "./GuestPhotoSelectedCard";
import { SelectedPhoto } from "./types";

type Props = {
  selectedPhotos: SelectedPhoto[];
  onRemovePhoto: (photoId: string) => void;
  onRemoveAllPhotos: () => void;
};

export function GuestPhotoSelectedSection({
  selectedPhotos,
  onRemovePhoto,
  onRemoveAllPhotos,
}: Props) {
  return (
    <>
      <AppDivider />

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <AppText variant="serifSubtitle">Seçilen Fotoğraflar</AppText>

          <View className="h-7 min-w-7 items-center justify-center rounded-full bg-primarySoft px-2">
            <AppText variant="captionStrong" className="text-primaryDark">
              {selectedPhotos.length}
            </AppText>
          </View>
        </View>

        {selectedPhotos.length > 0 ? (
          <Pressable onPress={onRemoveAllPhotos}>
            <AppText variant="caption">Tümünü Kaldır</AppText>
          </Pressable>
        ) : null}
      </View>

      {selectedPhotos.length > 0 ? (
        <View className="flex-row gap-3">
          {selectedPhotos.map((photo) => (
            <GuestPhotoSelectedCard
              key={photo.id}
              photo={photo}
              onRemove={onRemovePhoto}
            />
          ))}
        </View>
      ) : (
        <AppCard className="items-center justify-center !border border-primary !bg-primarySoft">
          <Ionicons name="images-outline" size={34} color="#B88BE6" />
          <AppText variant="caption">Henüz fotoğraf seçilmedi...</AppText>
        </AppCard>
      )}
    </>
  );
}
