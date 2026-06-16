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
    <AppCard>
      {items.map((item, index) => (
        <DowryChecklistItemRow
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          onToggle={onToggleItem}
          onDelete={onDeleteItem}
        />
      ))}
    </AppCard>
  );
}
