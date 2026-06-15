import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { GalleryFilterTabs } from "./GalleryFilterTabs";
import { GalleryPhoto, GalleryPhotoCard } from "./GalleryPhotoCard";

type Props = {
  title?: string;
  photos: GalleryPhoto[];
  photoLimit?: number;
  photoCount?: number;
  onPressPhoto?: (photo: GalleryPhoto) => void;
  onDownloadPhoto?: (photo: GalleryPhoto) => void;
  onDeletePhoto?: (photo: GalleryPhoto) => void;
};

export function GalleryPhotoGrid({
  title = "Tüm Fotoğraflar",
  photos,
  photoLimit,
  photoCount,
  onPressPhoto,
  onDownloadPhoto,
  onDeletePhoto,
}: Props) {
  const currentPhotoCount = photoCount ?? photos.length;

  const rows = photos.reduce<GalleryPhoto[][]>((acc, photo, index) => {
    const rowIndex = Math.floor(index / 3);

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    acc[rowIndex].push(photo);

    return acc;
  }, []);

  return (
    <View className="mt-7">
      <View className="flex-row items-center justify-between">
        <AppText variant="title" className="text-textDark">
          {title}
        </AppText>

        {typeof photoLimit === "number" ? (
          <AppText className="text-sm font-bold text-primary">
            {currentPhotoCount}/{photoLimit}
          </AppText>
        ) : null}
      </View>

      <GalleryFilterTabs />

      <View className="mt-6 gap-4">
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row gap-4">
            {row.map((photo) => (
              <GalleryPhotoCard
                key={photo.id}
                photo={photo}
                onPress={() => onPressPhoto?.(photo)}
                onDownload={() => onDownloadPhoto?.(photo)}
                onDelete={() => onDeletePhoto?.(photo)}
              />
            ))}

            {row.length < 3
              ? Array.from({ length: 3 - row.length }).map((_, index) => (
                  <View
                    key={`empty-${rowIndex}-${index}`}
                    className="aspect-square flex-1"
                  />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}
