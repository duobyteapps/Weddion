import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { GalleryFilter, GalleryFilterTabs } from "./GalleryFilterTabs";
import { GalleryPhoto, GalleryPhotoCard } from "./GalleryPhotoCard";

type Props = {
  title?: string;
  photos: GalleryPhoto[];
  photoLimit?: number;
  photoCount?: number;
  onPressPhoto?: (photo: GalleryPhoto) => void;
  onDownloadPhoto?: (photo: GalleryPhoto) => void;
  onDeletePhoto?: (photo: GalleryPhoto) => void;
  onDownloadAllPhotos?: () => void | Promise<void>;
  downloadAllLoading?: boolean;
};

function getRemainingDaysUntilExpire(expiresAt?: string) {
  if (!expiresAt) {
    return null;
  }

  const expireDate = new Date(expiresAt);
  const now = new Date();

  if (Number.isNaN(expireDate.getTime())) {
    return null;
  }

  const diffMs = expireDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays;
}

function shouldShowPhotoByFilter(photo: GalleryPhoto, filter: GalleryFilter) {
  if (filter === "all") {
    return true;
  }

  const remainingDays = getRemainingDaysUntilExpire(photo.expiresAt);

  if (remainingDays === null) {
    return false;
  }

  if (filter === "expires-1") {
    return remainingDays <= 1;
  }

  if (filter === "expires-4") {
    return remainingDays <= 4;
  }

  if (filter === "expires-7") {
    return remainingDays <= 7;
  }

  return true;
}

export function GalleryPhotoGrid({
  title = "Tüm Fotoğraflar",
  photos,
  photoLimit,
  photoCount,
  onPressPhoto,
  onDownloadPhoto,
  onDeletePhoto,
  onDownloadAllPhotos,
  downloadAllLoading = false,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<GalleryFilter>("all");

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) =>
      shouldShowPhotoByFilter(photo, selectedFilter),
    );
  }, [photos, selectedFilter]);

  const currentPhotoCount = photoCount ?? photos.length;

  const rows = filteredPhotos.reduce<GalleryPhoto[][]>((acc, photo, index) => {
    const rowIndex = Math.floor(index / 3);

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    acc[rowIndex].push(photo);

    return acc;
  }, []);

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <AppText variant="title">{title}</AppText>

          {typeof photoLimit === "number" ? (
            <AppText variant="caption" className="mt-1 text-textMuted">
              {currentPhotoCount}/{photoLimit} fotoğraf
            </AppText>
          ) : null}
        </View>

        {onDownloadAllPhotos && photos.length > 0 ? (
          <AppButton
            title={downloadAllLoading ? "İndiriliyor..." : "Tümünü İndir"}
            variant="ghost"
            onPress={onDownloadAllPhotos}
            loading={downloadAllLoading}
            disabled={downloadAllLoading}
            className="h-10 rounded-full px-4"
            textClassName="text-xs"
          />
        ) : null}
      </View>

      <GalleryFilterTabs
        selectedFilter={selectedFilter}
        onChangeFilter={setSelectedFilter}
      />

      <View className="gap-4">
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
