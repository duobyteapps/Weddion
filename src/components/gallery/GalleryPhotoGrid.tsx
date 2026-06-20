import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppIconBox } from "@/components/ui/AppIconBox";
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
  onDownloadSelectedPhotos?: (photos: GalleryPhoto[]) => void | Promise<void>;
  onDeleteSelectedPhotos?: (photos: GalleryPhoto[]) => void | Promise<void>;
  downloadAllLoading?: boolean;
  downloadSelectedLoading?: boolean;
  deleteSelectedLoading?: boolean;
};

function getPhotoAgeInDays(createdAt?: string) {
  if (!createdAt) {
    return null;
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();

  return diffMs / (1000 * 60 * 60 * 24);
}

function shouldShowPhotoByFilter(photo: GalleryPhoto, filter: GalleryFilter) {
  if (filter === "all") {
    return true;
  }

  const photoAgeInDays = getPhotoAgeInDays(photo.createdAt);

  if (photoAgeInDays === null) {
    return true;
  }

  if (filter === "last-1-day") {
    return photoAgeInDays <= 1;
  }

  if (filter === "last-4-days") {
    return photoAgeInDays <= 4;
  }

  if (filter === "last-7-days") {
    return photoAgeInDays <= 7;
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
  onDownloadSelectedPhotos,
  onDeleteSelectedPhotos,
  downloadAllLoading = false,
  downloadSelectedLoading = false,
  deleteSelectedLoading = false,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<GalleryFilter>("all");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) =>
      shouldShowPhotoByFilter(photo, selectedFilter),
    );
  }, [photos, selectedFilter]);

  const selectedPhotos = useMemo(() => {
    return photos.filter((photo) => selectedPhotoIds.includes(photo.id));
  }, [photos, selectedPhotoIds]);

  const currentPhotoCount = photoCount ?? photos.length;
  const isSelectionMode = selectedPhotoIds.length > 0;

  const rows = filteredPhotos.reduce<GalleryPhoto[][]>((acc, photo, index) => {
    const rowIndex = Math.floor(index / 3);

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    acc[rowIndex].push(photo);

    return acc;
  }, []);

  const handleLongPressPhoto = (photo: GalleryPhoto) => {
    setSelectedPhotoIds((currentIds) => {
      if (currentIds.includes(photo.id)) {
        return currentIds;
      }

      return [...currentIds, photo.id];
    });
  };

  const handlePressPhoto = (photo: GalleryPhoto) => {
    if (!isSelectionMode) {
      onPressPhoto?.(photo);
      return;
    }

    setSelectedPhotoIds((currentIds) => {
      if (currentIds.includes(photo.id)) {
        return currentIds.filter((photoId) => photoId !== photo.id);
      }

      return [...currentIds, photo.id];
    });
  };

  const handleCloseSelectionMode = () => {
    setSelectedPhotoIds([]);
  };

  const handleSelectAll = () => {
    setSelectedPhotoIds(filteredPhotos.map((photo) => photo.id));
  };

  const handleDownloadSelectedPhotos = async () => {
    if (selectedPhotos.length === 0 || downloadSelectedLoading) {
      return;
    }

    await onDownloadSelectedPhotos?.(selectedPhotos);
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotos.length === 0 || deleteSelectedLoading) {
      return;
    }

    await onDeleteSelectedPhotos?.(selectedPhotos);
    setSelectedPhotoIds([]);
  };

  return (
    <View>
      {isSelectionMode ? (
        <View className="mb-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <AppText variant="title">Seçilen Fotoğraflar</AppText>

              <AppText variant="caption" className="mt-1 text-textMuted">
                {selectedPhotoIds.length} fotoğraf seçildi
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCloseSelectionMode}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white"
            >
              <AppIconBox
                icon="x"
                iconSet="feather"
                color="#3D4266"
                size={24}
                className="h-8 w-8 bg-transparent"
              />
            </TouchableOpacity>
          </View>

          <View className="mt-5 flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSelectAll}
              className="h-12 flex-1 items-center justify-center rounded-xl border border-primary bg-white px-2"
            >
              <AppText className="text-center text-sm font-semibold text-primary">
                Tümünü Seç
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDownloadSelectedPhotos}
              disabled={
                selectedPhotos.length === 0 ||
                downloadSelectedLoading ||
                !onDownloadSelectedPhotos
              }
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary bg-white px-2"
            >
              <AppIconBox
                icon="download"
                iconSet="feather"
                color="#9A5BD6"
                size={18}
                className="h-6 w-6 bg-transparent"
              />

              <AppText className="text-center text-sm font-semibold text-primary">
                {downloadSelectedLoading
                  ? "İndiriliyor..."
                  : "Seçilenleri İndir"}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDeleteSelectedPhotos}
              disabled={
                selectedPhotos.length === 0 ||
                deleteSelectedLoading ||
                !onDeleteSelectedPhotos
              }
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-red-400 bg-white px-2"
            >
              <AppIconBox
                icon="trash-2"
                iconSet="feather"
                color="#FF4D45"
                size={18}
                className="h-6 w-6 bg-transparent"
              />

              <AppText className="text-center text-sm font-semibold text-red-500">
                {deleteSelectedLoading ? "Siliniyor..." : "Seçilenleri Sil"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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
      )}

      <GalleryFilterTabs
        selectedFilter={selectedFilter}
        onChangeFilter={setSelectedFilter}
      />

      <View className="gap-4">
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row gap-4">
            {row.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);

              return (
                <GalleryPhotoCard
                  key={photo.id}
                  photo={photo}
                  isSelectionMode={isSelectionMode}
                  isSelected={isSelected}
                  onPress={() => handlePressPhoto(photo)}
                  onLongPress={() => handleLongPressPhoto(photo)}
                  onDownload={() => onDownloadPhoto?.(photo)}
                  onDelete={() => onDeletePhoto?.(photo)}
                />
              );
            })}

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
