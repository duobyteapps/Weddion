import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { DowryFilterType } from "@/types/dowry";

type Props = {
  activeFilter: DowryFilterType;
  totalCount: number;
  completedCount: number;
  missingCount: number;
  onChangeFilter: (filter: DowryFilterType) => void;
};

export function DowryCategoryFilterTabs({
  activeFilter,
  totalCount,
  completedCount,
  missingCount,
  onChangeFilter,
}: Props) {
  const tabs: Array<{
    key: DowryFilterType;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "Tümü", count: totalCount },
    { key: "completed", label: "Tamamlanan", count: completedCount },
    { key: "missing", label: "Eksik", count: missingCount },
  ];

  return (
    <View className="mb-4 flex-row gap-3">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;

        return (
          <Pressable
            key={tab.key}
            className={`h-10 flex-1 items-center justify-center rounded-xl border ${
              isActive
                ? "border-primary bg-primary"
                : "border-borderSoft bg-primarySoft"
            }`}
            onPress={() => onChangeFilter(tab.key)}
          >
            <AppText
              variant="subtitle"
              className={`text-center !text-[10px] ${
                isActive ? "text-white" : "text-primaryDark"
              }`}
            >
              {tab.label} ({tab.count})
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
