import { AppText } from "@/components/ui/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity } from "react-native";

export type InvitationCategory = string;

export type InvitationCategoryItem = {
  id: string;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSet?: "ionicons" | "material";
};

type Props = {
  categories: InvitationCategoryItem[];
  selectedCategory: InvitationCategory;
  onChangeCategory: (category: InvitationCategory) => void;
};

function getCategoryIcon(categoryTitle: string) {
  const normalizedTitle = categoryTitle.toLocaleLowerCase("tr-TR");

  if (normalizedTitle.includes("çiçek")) {
    return {
      icon: "flower-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconSet: "material" as const,
    };
  }

  if (normalizedTitle.includes("minimal")) {
    return {
      icon: "leaf-outline" as keyof typeof Ionicons.glyphMap,
      iconSet: "ionicons" as const,
    };
  }

  if (normalizedTitle.includes("klasik")) {
    return {
      icon: "business-outline" as keyof typeof Ionicons.glyphMap,
      iconSet: "ionicons" as const,
    };
  }

  if (normalizedTitle.includes("modern")) {
    return {
      icon: "sparkles-outline" as keyof typeof Ionicons.glyphMap,
      iconSet: "ionicons" as const,
    };
  }

  return {
    icon: "grid-outline" as keyof typeof Ionicons.glyphMap,
    iconSet: "ionicons" as const,
  };
}

export function InvitationCategoryFilter({
  categories,
  selectedCategory,
  onChangeCategory,
}: Props) {
  const filterCategories: InvitationCategoryItem[] = [
    {
      id: "all",
      title: "Tümü",
      icon: "grid-outline",
      iconSet: "ionicons",
    },
    ...categories,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {filterCategories.map((item) => {
        const isActive = selectedCategory === item.id;
        const fallbackIcon = getCategoryIcon(item.title);
        const icon = item.icon ?? fallbackIcon.icon;
        const iconSet = item.iconSet ?? fallbackIcon.iconSet;

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => onChangeCategory(item.id)}
            className={[
              "h-10 px-4 rounded-xl flex-row items-center gap-1.5 shadow-sm",
              isActive ? "bg-primary" : "bg-white",
            ].join(" ")}
          >
            {iconSet === "material" ? (
              <MaterialCommunityIcons
                name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={17}
                color={isActive ? "#FFFFFF" : "#8B5FBF"}
              />
            ) : (
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={isActive ? "#FFFFFF" : "#8B5FBF"}
              />
            )}

            <AppText
              className={[
                "text-xs font-manropeSemiBold",
                isActive ? "text-white" : "text-primary",
              ].join(" ")}
            >
              {item.title}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
