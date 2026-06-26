import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

import { AppCard } from "../ui/AppCard";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type DowryShoppingSummaryCardProps = {
  total: number;
  completed: number;
  missing: number;
};

type ShoppingSummaryItemProps = {
  icon: MaterialIconName;
  label: string;
  value: number;
  iconColor?: string;
  iconBackground?: string;
};

function ShoppingSummaryItem({
  icon,
  label,
  value,
  iconColor = Colors.primary,
  iconBackground = Colors.primarySoft,
}: ShoppingSummaryItemProps) {
  return (
    <View className="flex-1 items-center">
      <View
        className="mb-2 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBackground }}
      >
        <MaterialCommunityIcons name={icon} size={23} color={iconColor} />
      </View>

      <AppText
        variant="body"
        className="text-center text-[12px] leading-[17px] text-[#4C4B78]"
      >
        {label}
      </AppText>

      <AppText
        variant="title"
        className="mt-1 text-[20px] leading-[25px] text-[#151866]"
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
    <AppCard className="mt-6">
      <AppText variant="serifTitle" className="mb-4">
        Ürün Özeti
      </AppText>

      <View className="flex-row items-center">
        <ShoppingSummaryItem
          icon="basket-outline"
          label="Toplam"
          value={total}
          iconColor={Colors.primary}
          iconBackground={Colors.primarySoft}
        />

        <View className="h-[88px] w-px bg-[#EEEAF8]" />

        <ShoppingSummaryItem
          icon="check-circle-outline"
          label="Tamamlanan"
          value={completed}
          iconColor={Colors.success}
          iconBackground="#EAF8F1"
        />

        <View className="h-[88px] w-px bg-[#EEEAF8]" />

        <ShoppingSummaryItem
          icon="cart-outline"
          label="Eksik"
          value={missing}
          iconColor={Colors.primary}
          iconBackground={Colors.primarySoft}
        />
      </View>
    </AppCard>
  );
}
