import { AppText } from "@/components/ui/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

export type InvitationCategory =
  | "all"
  | "flower"
  | "minimal"
  | "classic"
  | "modern";

type CategoryItem = {
  id: InvitationCategory;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconSet?: "ionicons" | "material";
};

const categories: CategoryItem[] = [
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
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {categories.map((item) => {
          const isActive = selectedCategory === item.id;

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
              {item.iconSet === "material" ? (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={14}
                  color={isActive ? "#FFFFFF" : "#18214D"}
                />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isActive ? "#FFFFFF" : "#18214D"}
                />
              )}

              <AppText
                className={[
                  "text-xs",
                  isActive ? "text-white" : "text-[#18214D]",
                ].join(" ")}
              >
                {item.title}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
