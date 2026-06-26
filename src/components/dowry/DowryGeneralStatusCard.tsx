import { View } from "react-native";

import { Colors } from "@/constants/Colors";

import { AppCard } from "../ui/AppCard";
import { AppText } from "../ui/AppText";
import { DowryCircularProgress } from "./DowryCircularProgress";
import { DowryGeneralInfoRow } from "./DowryGeneralInfoRow";

type DowryGeneralStatusCardProps = {
  progress: number;
  budget: number;
  expense: number;
  remaining: number;
};

function formatMoney(value: number) {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

export function DowryGeneralStatusCard({
  progress,
  budget,
  expense,
  remaining,
}: DowryGeneralStatusCardProps) {
  const generalInfoItems = [
    {
      id: "budget",
      icon: "wallet-outline" as const,
      label: "Bütçe",
      value: formatMoney(budget),
      iconColor: Colors.primary,
      iconBackground: Colors.primarySoft,
    },
    {
      id: "expense",
      icon: "cash-minus" as const,
      label: "Gider",
      value: formatMoney(expense),
      iconColor: Colors.error,
      iconBackground: "#FDECEC",
    },
    {
      id: "remaining",
      icon: "cash-check" as const,
      label: "Kalan Para",
      value: formatMoney(remaining),
      iconColor: Colors.success,
      iconBackground: "#EAF8F1",
    },
  ];

  return (
    <AppCard>
      <AppText variant="serifTitle" className="mb-4">
        Genel Durum
      </AppText>

      <View className="flex-row items-center gap-[32px]">
        <DowryCircularProgress value={progress} />

        <View className="gap-5">
          {generalInfoItems.map((item) => (
            <DowryGeneralInfoRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              value={item.value}
              iconColor={item.iconColor}
              iconBackground={item.iconBackground}
            />
          ))}
        </View>
      </View>
    </AppCard>
  );
}
