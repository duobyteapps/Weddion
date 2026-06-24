import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";

export type InvitationCategory = string;

export type InvitationCategoryItem = {
  id: string;
  title: string;
  slug?: string;
  icon?: string;
  iconSet?: "ionicons" | "material" | "feather";
};

type Props = {
  categories: InvitationCategoryItem[];
  selectedCategory: InvitationCategory;
  onChangeCategory: (category: InvitationCategory) => void;
};

function getCategoryIcon(
  category: InvitationCategoryItem,
): Pick<AppFilterTabItem<string>, "icon" | "iconSet"> {
  const value = `${category.slug ?? ""} ${category.title}`.toLocaleLowerCase(
    "tr-TR",
  );

  if (value.includes("flower") || value.includes("çiçek")) {
    return {
      icon: "flower-outline",
      iconSet: "material",
    };
  }

  if (value.includes("minimal")) {
    return {
      icon: "leaf-outline",
      iconSet: "ionicons",
    };
  }

  if (value.includes("classic") || value.includes("klasik")) {
    return {
      icon: "business-outline",
      iconSet: "ionicons",
    };
  }

  if (value.includes("modern")) {
    return {
      icon: "sparkles-outline",
      iconSet: "ionicons",
    };
  }

  if (value.includes("nature") || value.includes("doğa")) {
    return {
      icon: "leaf-outline",
      iconSet: "ionicons",
    };
  }

  return {
    icon: "grid-outline",
    iconSet: "ionicons",
  };
}

export function InvitationCategoryFilter({
  categories,
  selectedCategory,
  onChangeCategory,
}: Props) {
  const filterItems: AppFilterTabItem<string>[] = [
    {
      id: "all",
      title: "Tümü",
      icon: "grid-outline",
    },
    ...categories.map((category) => {
      const fallbackIcon = getCategoryIcon(category);

      return {
        id: category.id,
        title: category.title,
        icon: category.icon ?? fallbackIcon.icon,
        iconSet: category.iconSet ?? fallbackIcon.iconSet,
      };
    }),
  ];

  return (
    <AppFilterTabs
      items={filterItems}
      selectedValue={selectedCategory}
      onChangeValue={onChangeCategory}
    />
  );
}
