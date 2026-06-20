import { AppIconBox } from "@/components/ui/AppIconBox";
import { Image, TouchableOpacity, View } from "react-native";

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  createdAt?: string;
  expiresAt?: string | null;
};

type Props = {
  photo: GalleryPhoto;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

export function GalleryPhotoCard({
  photo,
  isSelectionMode = false,
  isSelected = false,
  onPress,
  onLongPress,
  onDownload,
  onDelete,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-white"
    >
      <Image
        source={{ uri: photo.imageUrl }}
        resizeMode="cover"
        className="h-full w-full"
      />

      {isSelectionMode ? (
        <View
          pointerEvents="none"
          className="absolute inset-0"
          style={{
            backgroundColor: isSelected
              ? "rgba(151, 93, 213, 0.42)"
              : "rgba(0, 0, 0, 0.04)",
          }}
        />
      ) : null}

      {isSelected ? (
        <View className="absolute right-2 top-2 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary">
          <AppIconBox
            icon="check"
            iconSet="feather"
            color="#FFFFFF"
            size={22}
            className="h-8 w-8 rounded-full bg-transparent"
          />
        </View>
      ) : null}

      {!isSelectionMode ? (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDelete}
            className="absolute right-2 top-2"
          >
            <AppIconBox
              icon="trash-2"
              iconSet="feather"
              color="#FF5A5F"
              size={12}
              className="h-6 w-6 rounded-full bg-red-50"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDownload}
            className="absolute bottom-2 right-2"
          >
            <AppIconBox
              icon="download"
              iconSet="feather"
              size={12}
              className="h-6 w-6 rounded-full bg-white"
            />
          </TouchableOpacity>
        </>
      ) : null}
    </TouchableOpacity>
  );
}
