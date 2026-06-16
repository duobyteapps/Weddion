import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { AppCard } from "../ui/AppCard";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type DowryShoppingSummaryCardProps = {
  total: number;
  completed: number;
  missing: number;
};

const PURPLE = "#8F6BC8";
const GREEN = "#0E9F6E";
const GREEN_SOFT = "#EAF8F1";

function ShoppingSummaryItem({
  icon,
  label,
  value,
  iconColor = PURPLE,
  iconBackground = "transparent",
}: {
  icon: MaterialIconName;
  label: string;
  value: number;
  iconColor?: string;
  iconBackground?: string;
}) {
  return (
    <View className="flex-1 items-center">
      <View
        className="mb-3 h-[54px] w-[54px] items-center justify-center rounded-full"
        style={{ backgroundColor: iconBackground }}
      >
        <MaterialCommunityIcons name={icon} size={34} color={iconColor} />
      </View>

      <AppText
        variant="body"
        className="text-center text-[15px] leading-[20px] text-[#4C4B78]"
      >
        {label}
      </AppText>

      <AppText
        variant="title"
        className="mt-2 text-[25px] leading-[30px] text-[#151866]"
      >
        {value}
      </AppText>
    </View>
  );
}

export function DowryShoppingSummaryCard({
  total,
  completed,
  missing,
}: DowryShoppingSummaryCardProps) {
  return (
    <AppCard>
      <AppText variant="serifTitle">Alışveriş Özeti</AppText>
      <View className="flex-row items-center">
        <ShoppingSummaryItem
          icon="cart-outline"
          label="Eksik Ürün"
          value={missing}
        />

        <ShoppingSummaryItem
          icon="basket-outline"
          label="Toplam"
          value={total}
        />

        <ShoppingSummaryItem
          icon="check-circle-outline"
          label="Tamamlanan"
          value={completed}
          iconColor={GREEN}
          iconBackground={GREEN_SOFT}
        />
      </View>
    </AppCard>
  );
}
