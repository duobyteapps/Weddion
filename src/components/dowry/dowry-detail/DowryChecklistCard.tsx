import { ScrollView, View } from "react-native";

import { DowryChecklistItemRow } from "@/components/dowry/dowry-detail/DowryChecklistItemRow";
import { DowryChecklistItem } from "@/types/dowry";

type Props = {
  items: DowryChecklistItem[];
  onToggleItem?: (item: DowryChecklistItem) => void;
  onDeleteItem?: (item: DowryChecklistItem) => void;
  onUpdateItem?: (item: DowryChecklistItem) => void;
};

export function DowryChecklistCard({
  items,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
}: Props) {
  return (
    <View className="h-full overflow-hidden">
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 4,
        }}
      >
        {items.map((item, index) => (
          <DowryChecklistItemRow
            key={item.id}
            item={item}
            onToggle={onToggleItem}
            onDelete={onDeleteItem}
            onUpdate={onUpdateItem}
          />
        ))}
      </ScrollView>
    </View>
  );
}
