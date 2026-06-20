import { AppIconBox } from "@/components/ui/AppIconBox";
import { Feather } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  createdAt?: string;
  expiresAt?: string | null;
};

type Props = {
  photo: GalleryPhoto;
  selected?: boolean;
  selectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

export function GalleryPhotoCard({
  photo,
  selected = false,
  selectionMode = false,
  onPress,
  onLongPress,
  onDownload,
  onDelete,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      delayLongPress={250}
      onPress={onPress}
      onLongPress={onLongPress}
      className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-white"
    >
      <Image
        source={{ uri: photo.imageUrl }}
        resizeMode="cover"
        className="h-full w-full"
      />

      {selectionMode ? (
        <View className="absolute inset-0">
          {selected ? (
            <View className="absolute inset-0 bg-primary/25" />
          ) : null}

          <View
            className={[
              "absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full border border-white",
              selected ? "bg-primary" : "bg-black/20",
            ].join(" ")}
          >
            {selected ? (
              <Feather name="check" size={10} color="#FFFFFF" />
            ) : null}
          </View>
        </View>
      ) : (
        <>
          {onDelete ? (
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
          ) : null}

          {onDownload ? (
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
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}
