import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
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
        <Pressable
          className={`mr-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
            item.completed ? "border-primary bg-primary" : "border-primaryLight"
          }`}
          onPress={() => onToggle?.(item)}
        >
          {item.completed ? (
            <MaterialCommunityIcons
              name="check"
              size={14}
              color={Colors.white}
            />
          ) : null}
        </Pressable>

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
