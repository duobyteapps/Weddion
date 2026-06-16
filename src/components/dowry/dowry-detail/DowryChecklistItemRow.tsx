import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppCheckbox } from "@/components/ui/AppCheckbox";
import { AppDivider } from "@/components/ui/AppDivider";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { DowryChecklistItem } from "@/types/dowry";

type Props = {
  item: DowryChecklistItem;
  isLast?: boolean;
  onToggle?: (item: DowryChecklistItem) => void;
  onDelete?: (item: DowryChecklistItem) => void;
};

export function DowryChecklistItemRow({
  item,
  isLast = false,
  onToggle,
  onDelete,
}: Props) {
  return (
    <View>
      <AppCard noMargin className="flex-row items-center">
        <AppCheckbox
          checked={item.completed}
          onPress={() => onToggle?.(item)}
        />

        <AppText
          variant="serifSubtitle"
          className="flex-1 !text-[14px]"
          numberOfLines={1}
        >
          {item.title}
        </AppText>

        <Pressable
          className="ml-3 h-8 w-8 items-center justify-center"
          onPress={() => onDelete?.(item)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={Colors.error}
          />
        </Pressable>
      </AppCard>

      {!isLast ? <AppDivider /> : null}
    </View>
  );
}
