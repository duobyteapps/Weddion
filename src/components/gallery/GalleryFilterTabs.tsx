import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";

export type GalleryFilter =
  | "all"
  | "last-1-day"
  | "last-4-days"
  | "last-7-days";

const galleryFilterOptions: AppFilterTabItem<GalleryFilter>[] = [
  { id: "all", title: "Tümü" },
  { id: "last-1-day", title: "1 Gün" },
  { id: "last-4-days", title: "4 Gün" },
  { id: "last-7-days", title: "7 Gün" },
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
