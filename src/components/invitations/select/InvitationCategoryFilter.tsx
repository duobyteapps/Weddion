import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";

export type InvitationCategory =
  | "all"
  | "flower"
  | "minimal"
  | "classic"
  | "modern";

const categories: AppFilterTabItem<InvitationCategory>[] = [
  { id: "all", title: "Tümü", icon: "grid-outline" },
  {
    id: "flower",
    title: "Çiçekli",
    icon: "flower-outline",
    iconSet: "material",
  },
  { id: "minimal", title: "Minimal", icon: "leaf-outline" },
  { id: "classic", title: "Klasik", icon: "business-outline" },
  { id: "modern", title: "Modern", icon: "sparkles-outline" },
];

type Props = {
  selectedCategory: InvitationCategory;
  onChangeCategory: (category: InvitationCategory) => void;
};

export function InvitationCategoryFilter({
  selectedCategory,
  onChangeCategory,
}: Props) {
  return (
    <AppFilterTabs
      items={categories}
      selectedValue={selectedCategory}
      onChangeValue={onChangeCategory}
    />
  );
}
