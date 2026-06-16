import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
  onUpdate?: (item: DowryChecklistItem) => void;
};

export function DowryChecklistItemRow({
  item,
  isLast = false,
  onToggle,
  onDelete,
  onUpdate,
}: Props) {
  return (
    <View>
      <AppCard noMargin className="flex-row items-center">
        <AppCheckbox
          checked={item.completed}
          onPress={() => onToggle?.(item)}
        />

        <View className="w-[145px]">
          <AppText
            variant="serifSubtitle"
            className="!text-[14px]"
            numberOfLines={1}
          >
            {item.title}
          </AppText>

          <AppText
            variant="caption"
            className="mt-1 text-textMuted"
            numberOfLines={1}
          >
            {item.brandName?.trim() ? item.brandName : "-"}
          </AppText>
        </View>

        <View className="ml-3 items-center justify-center">
          <View className="rounded-full bg-primarySoft px-3 py-1">
            <AppText
              variant="caption"
              className="text-center text-primary"
              numberOfLines={1}
            >
              {item.quantity ?? 1} adet
            </AppText>
          </View>
        </View>

        <View className="flex-1" />

        <Pressable
          className="h-8 w-8 items-center justify-center"
          onPress={() => onUpdate?.(item)}
        >
          <Feather name="edit-3" size={15} color="#A875D1" />
        </Pressable>

        <Pressable
          className="h-8 w-8 items-center justify-center"
          onPress={() => onDelete?.(item)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={15}
            color={Colors.error}
          />
        </Pressable>
      </AppCard>

      {!isLast ? <AppDivider /> : null}
    </View>
  );
}
