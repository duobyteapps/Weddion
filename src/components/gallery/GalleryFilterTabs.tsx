import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";
import { useState } from "react";

type GalleryFilter = "all" | "today" | "yesterday" | "week" | "month";

const galleryFilterOptions: AppFilterTabItem<GalleryFilter>[] = [
  { id: "all", title: "Tümü" },
  { id: "today", title: "Bugün" },
  { id: "yesterday", title: "Dün" },
  { id: "week", title: "Bu Hafta" },
  { id: "month", title: "Bu Ay" },
];

export function GalleryFilterTabs() {
  const [selectedFilter, setSelectedFilter] = useState<GalleryFilter>("all");

  return (
    <AppFilterTabs
      fullWidth
      items={galleryFilterOptions}
      selectedValue={selectedFilter}
      onChangeValue={setSelectedFilter}
    />
  );
}
