import { View } from "react-native";

import { Colors } from "@/constants/Colors";
import { AppCard } from "../ui/AppCard";
import { AppText } from "../ui/AppText";
import { DowryCircularProgress } from "./DowryCircularProgress";
import { DowryGeneralInfoRow } from "./DowryGeneralInfoRow";

type DowryGeneralStatusCardProps = {
  progress: number;
  total: number;
  completed: number;
  missing: number;
};

export function DowryGeneralStatusCard({
  progress,
  total,
  completed,
  missing,
}: DowryGeneralStatusCardProps) {
  const generalInfoItems = [
    {
      id: "total",
      icon: "gift-outline" as const,
      label: "Toplam Ürün",
      value: total,
      iconColor: Colors.primary,
      iconBackground: Colors.primarySoft,
    },
    {
      id: "completed",
      icon: "check-circle-outline" as const,
      label: "Tamamlanan",
      value: completed,
      iconColor: Colors.success,
      iconBackground: "#EAF8F1",
    },
    {
      id: "missing",
      icon: "cart-outline" as const,
      label: "Eksik",
      value: missing,
      iconColor: Colors.primary,
      iconBackground: Colors.primarySoft,
    },
  ];

  return (
    <AppCard>
      <AppText variant="serifTitle" className="mb-4">
        Genel Durum
      </AppText>

      <View className="flex-row items-center gap-[32px]">
        <DowryCircularProgress value={progress} />

        <View className="gap-3">
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
