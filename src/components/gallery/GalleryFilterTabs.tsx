import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";

export type GalleryFilter = "all" | "expires-1" | "expires-4" | "expires-7";

export const galleryFilterOptions: AppFilterTabItem<GalleryFilter>[] = [
  { id: "all", title: "Tümü" },
  { id: "expires-1", title: "1 Gün" },
  { id: "expires-4", title: "4 Gün" },
  { id: "expires-7", title: "7 Gün" },
];

type Props = {
  selectedFilter: GalleryFilter;
  onChangeFilter: (filter: GalleryFilter) => void;
};

export function GalleryFilterTabs({ selectedFilter, onChangeFilter }: Props) {
  return (
    <AppFilterTabs
      fullWidth
      items={galleryFilterOptions}
      selectedValue={selectedFilter}
      onChangeValue={onChangeFilter}
    />
  );
}
