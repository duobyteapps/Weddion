import { ScrollView, View } from "react-native";

import { DowryChecklistItemRow } from "@/components/dowry/dowry-detail/DowryChecklistItemRow";
import { DowryChecklistItem } from "@/types/dowry";

type Props = {
  items: DowryChecklistItem[];
  onToggleItem?: (item: DowryChecklistItem) => void;
  onDeleteItem?: (item: DowryChecklistItem) => void;
  onUpdateItem?: (item: DowryChecklistItem) => void;
  shouldScroll?: boolean;
  maxListHeight?: number;
};

export function DowryChecklistCard({
  items,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  shouldScroll = false,
  maxListHeight = 400,
}: Props) {
  if (shouldScroll) {
    return (
      <View className="overflow-hidden" style={{ maxHeight: maxListHeight }}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 4,
          }}
        >
          {items.map((item) => (
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

  return (
    <View className="overflow-hidden">
      {items.map((item) => (
        <DowryChecklistItemRow
          key={item.id}
          item={item}
          onToggle={onToggleItem}
          onDelete={onDeleteItem}
          onUpdate={onUpdateItem}
        />
      ))}
    </View>
  );
}
