import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppCheckbox } from "@/components/ui/AppCheckbox";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { DowryChecklistItem } from "@/types/dowry";

type Props = {
  item: DowryChecklistItem;
  onToggle?: (item: DowryChecklistItem) => void;
  onDelete?: (item: DowryChecklistItem) => void;
  onUpdate?: (item: DowryChecklistItem) => void;
};

const OWNER_COLOR = "#8FAF8B";
const MEMBER_COLOR = "#C9B37E";

function getCreatorColor(item: DowryChecklistItem) {
  return item.creatorRole === "member" ? MEMBER_COLOR : OWNER_COLOR;
}

function formatPrice(price?: number | string | null) {
  if (price === null || price === undefined || price === "") {
    return null;
  }

  const parsedPrice =
    typeof price === "number" ? price : Number(String(price).replace(",", "."));

  if (!Number.isFinite(parsedPrice)) {
    return null;
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(parsedPrice);
}

export function DowryChecklistItemRow({
  item,
  onToggle,
  onDelete,
  onUpdate,
}: Props) {
  const formattedPrice = formatPrice(item.price);
  const creatorColor = getCreatorColor(item);

  return (
    <AppCard
      noMargin
      className="relative mb-2 flex-row items-center overflow-hidden"
    >
      <AppCheckbox checked={item.completed} onPress={() => onToggle?.(item)} />

      <View className="ml-3 w-[120px]">
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
        {formattedPrice ? (
          <AppText
            variant="caption"
            className="mb-1 text-center text-textMuted"
            numberOfLines={1}
          >
            {formattedPrice}
          </AppText>
        ) : null}

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
        className="h-8 w-8 items-center justify-center rounded-full bg-primarySoft"
        onPress={() => onUpdate?.(item)}
      >
        <Feather name="edit-3" size={15} color="#A875D1" />
      </Pressable>

      <Pressable
        className="ml-2 h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50"
        onPress={() => onDelete?.(item)}
      >
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={15}
          color={Colors.error}
        />
      </Pressable>
      <View
        pointerEvents="none"
        className="absolute -bottom-2 -top-2 left-0 w-1"
        style={{ backgroundColor: creatorColor }}
      />
    </AppCard>
  );
}
