import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { GalleryFilterTabs, type GalleryFilter } from "./GalleryFilterTabs";
import { GalleryPhoto, GalleryPhotoCard } from "./GalleryPhotoCard";
import { GallerySelectionActions } from "./GallerySelectionActions";

type Props = {
  title?: string;
  photos: GalleryPhoto[];
  photoLimit?: number;
  photoCount?: number;
  downloadAllLoading?: boolean;
  downloadSelectedLoading?: boolean;
  deleteSelectedLoading?: boolean;
  onPressPhoto?: (photo: GalleryPhoto) => void;
  onLongPressPhoto?: (photo: GalleryPhoto) => void;
  onDownloadPhoto?: (photo: GalleryPhoto) => void;
  onDeletePhoto?: (photo: GalleryPhoto) => void;
  onDownloadAllPhotos?: () => void | Promise<void>;
  onDownloadSelectedPhotos?: (photos: GalleryPhoto[]) => void | Promise<void>;
  onDeleteSelectedPhotos?: (photos: GalleryPhoto[]) => void | Promise<void>;
};

function isPhotoInFilter(photo: GalleryPhoto, filter: GalleryFilter) {
  if (filter === "all") {
    return true;
  }

  if (!photo.createdAt) {
    return false;
  }

  const createdAtTime = new Date(photo.createdAt).getTime();

  if (Number.isNaN(createdAtTime)) {
    return false;
  }

  const now = Date.now();

  const filterDays: Record<Exclude<GalleryFilter, "all">, number> = {
    "last-1-day": 1,
    "last-4-days": 4,
    "last-7-days": 7,
  };

  const dayCount = filterDays[filter];
  const minTime = now - dayCount * 24 * 60 * 60 * 1000;

  return createdAtTime >= minTime;
}

export function GalleryPhotoGrid({
  title = "Tüm Fotoğraflar",
  photos,
  photoLimit,
  photoCount,
  downloadAllLoading = false,
  downloadSelectedLoading = false,
  deleteSelectedLoading = false,
  onPressPhoto,
  onLongPressPhoto,
  onDownloadPhoto,
  onDeletePhoto,
  onDownloadAllPhotos,
  onDownloadSelectedPhotos,
  onDeleteSelectedPhotos,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<GalleryFilter>("all");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => isPhotoInFilter(photo, selectedFilter));
  }, [photos, selectedFilter]);

  const selectionMode = selectedPhotoIds.length > 0;
  const currentPhotoCount = photoCount ?? photos.length;

  const selectedPhotos = useMemo(() => {
    return photos.filter((photo) => selectedPhotoIds.includes(photo.id));
  }, [photos, selectedPhotoIds]);

  const allSelected =
    filteredPhotos.length > 0 &&
    filteredPhotos.every((photo) => selectedPhotoIds.includes(photo.id));

  const rows = filteredPhotos.reduce<GalleryPhoto[][]>((acc, photo, index) => {
    const rowIndex = Math.floor(index / 3);

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    acc[rowIndex].push(photo);

    return acc;
  }, []);

  const handlePressPhoto = (photo: GalleryPhoto) => {
    if (!selectionMode) {
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

  const handleLongPressPhoto = (photo: GalleryPhoto) => {
    onLongPressPhoto?.(photo);

    setSelectedPhotoIds((currentIds) => {
      if (currentIds.includes(photo.id)) {
        return currentIds;
      }

      return [...currentIds, photo.id];
    });
  };

  const handleSelectAllPhotos = () => {
    setSelectedPhotoIds((currentIds) => {
      const filteredPhotoIds = filteredPhotos.map((photo) => photo.id);

      const isEveryFilteredPhotoSelected = filteredPhotoIds.every((photoId) =>
        currentIds.includes(photoId),
      );

      if (isEveryFilteredPhotoSelected) {
        return currentIds.filter(
          (photoId) => !filteredPhotoIds.includes(photoId),
        );
      }

      return Array.from(new Set([...currentIds, ...filteredPhotoIds]));
    });
  };

  const handleCancelSelection = () => {
    setSelectedPhotoIds([]);
  };

  const handleChangeFilter = (filter: GalleryFilter) => {
    setSelectedFilter(filter);
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
    <View className="mt-7">
      {!selectionMode ? (
        <View className="mb-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <AppText variant="title" className="text-textDark">
                {title}
              </AppText>

              {typeof photoLimit === "number" ? (
                <AppText className="mt-1 text-[13px] text-textMuted">
                  {currentPhotoCount}/{photoLimit} fotoğraf
                </AppText>
              ) : null}
            </View>

            {onDownloadAllPhotos && photos.length > 0 ? (
              <AppButton
                title="Tümünü İndir"
                variant="ghost"
                loading={downloadAllLoading}
                disabled={downloadAllLoading}
                onPress={onDownloadAllPhotos}
              />
            ) : null}
          </View>

          <GalleryFilterTabs
            selectedFilter={selectedFilter}
            onChangeFilter={handleChangeFilter}
          />
        </View>
      ) : (
        <GallerySelectionActions
          selectedCount={selectedPhotoIds.length}
          allSelected={allSelected}
          downloadLoading={downloadSelectedLoading}
          deleteLoading={deleteSelectedLoading}
          onSelectAll={handleSelectAllPhotos}
          onDownloadSelected={handleDownloadSelectedPhotos}
          onDeleteSelected={handleDeleteSelectedPhotos}
          onCancelSelection={handleCancelSelection}
        />
      )}

      {rows.map((row, rowIndex) => (
        <View key={`gallery-row-${rowIndex}`} className="mb-3 flex-row gap-3">
          {row.map((photo) => {
            const selected = selectedPhotoIds.includes(photo.id);

            return (
              <GalleryPhotoCard
                key={photo.id}
                photo={photo}
                selected={selected}
                selectionMode={selectionMode}
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
                  key={`gallery-empty-${rowIndex}-${index}`}
                  className="flex-1"
                />
              ))
            : null}
        </View>
      ))}
    </View>
  );
}
