import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";
import { GalleryFilterTabs } from "./GalleryFilterTabs";
import { GalleryPhoto, GalleryPhotoCard } from "./GalleryPhotoCard";

type Props = {
  title?: string;
  photos: GalleryPhoto[];
  onPressPhoto?: (photo: GalleryPhoto) => void;
  onDownloadPhoto?: (photo: GalleryPhoto) => void;
};

export function GalleryPhotoGrid({
  title = "Tüm Fotoğraflar",
  photos,
  onPressPhoto,
  onDownloadPhoto,
}: Props) {
  const rows = photos.reduce<GalleryPhoto[][]>((acc, photo, index) => {
    const rowIndex = Math.floor(index / 3);

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    acc[rowIndex].push(photo);

    return acc;
  }, []);

  return (
    <View className="mb-5">
      <AppText variant="serifTitle" className="mb-4">
        {title}
      </AppText>

      <GalleryFilterTabs />

      <View className="gap-3">
        {rows.map((row, rowIndex) => (
          <View key={`gallery-row-${rowIndex}`} className="flex-row gap-3">
            {row.map((photo) => (
              <GalleryPhotoCard
                key={photo.id}
                photo={photo}
                onPress={() => onPressPhoto?.(photo)}
                onDownload={() => onDownloadPhoto?.(photo)}
              />
            ))}

            {row.length < 3
              ? Array.from({ length: 3 - row.length }).map((_, index) => (
                  <View
                    key={`empty-photo-${rowIndex}-${index}`}
                    className="flex-1"
                  />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}
