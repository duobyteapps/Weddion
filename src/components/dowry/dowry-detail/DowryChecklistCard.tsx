import { ScrollView } from "react-native";

import { DowryChecklistItemRow } from "@/components/dowry/dowry-detail/DowryChecklistItemRow";
import { AppCard } from "@/components/ui/AppCard";
import { DowryChecklistItem } from "@/types/dowry";

type Props = {
  items: DowryChecklistItem[];
  onToggleItem?: (item: DowryChecklistItem) => void;
  onDeleteItem?: (item: DowryChecklistItem) => void;
};

export function DowryChecklistCard({
  items,
  onToggleItem,
  onDeleteItem,
}: Props) {
  return (
    <AppCard noMargin className="h-full overflow-hidden">
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
            isLast={index === items.length - 1}
            onToggle={onToggleItem}
            onDelete={onDeleteItem}
          />
        ))}
      </ScrollView>
    </AppCard>
  );
}
