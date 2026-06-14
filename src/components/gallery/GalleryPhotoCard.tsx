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
};

export function GalleryPhotoCard({ photo, onPress, onDownload }: Props) {
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
        onPress={onDownload}
        className="absolute bottom-2 right-2"
      >
        <AppIconBox
          icon="download"
          iconSet="feather"
          className="h-8 w-8 rounded-full bg-white"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
