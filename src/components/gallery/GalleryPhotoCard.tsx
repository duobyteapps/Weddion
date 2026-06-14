import { AppIconBox } from "@/components/ui/AppIconBox";
import { Image, TouchableOpacity } from "react-native";

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  createdAt?: string;
};

type Props = {
  photo: GalleryPhoto;
  onPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

export function GalleryPhotoCard({
  photo,
  onPress,
  onDownload,
  onDelete,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-white"
    >
      <Image
        source={{ uri: photo.imageUrl }}
        resizeMode="cover"
        className="h-full w-full"
      />

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
    </TouchableOpacity>
  );
}
