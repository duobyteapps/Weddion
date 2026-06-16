import {
  DowryCategoryItem,
  DowryCategoryRow,
} from "@/components/dowry/DowryCategoryRow";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

type DowryCategoryStatusCardProps = {
  categories: DowryCategoryItem[];
  onPressCategory?: (category: DowryCategoryItem) => void;
};

export function DowryCategoryStatusCard({
  categories,
  onPressCategory,
}: DowryCategoryStatusCardProps) {
  return (
    <AppCard>
      <AppText variant="serifTitle" className="mb-4">
        Kategori Durumu
      </AppText>

      <View className="gap-3">
        {categories.map((category) => (
          <DowryCategoryRow
            key={category.id}
            category={category}
            onPress={onPressCategory}
          />
        ))}
      </View>
    </AppCard>
  );
}
