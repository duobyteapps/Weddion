import { ScrollView } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryStatusCard } from "@/components/dowry/DowryCategoryStatusCard";
import { DowryGeneralStatusCard } from "@/components/dowry/DowryGeneralStatusCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

const categories = [
  {
    id: "kitchen",
    title: "Mutfak",
    icon: "pot-steam-outline",
    completed: 18,
    total: 25,
  },
  {
    id: "bedroom",
    title: "Yatak Odası",
    icon: "bed-king-outline",
    completed: 12,
    total: 20,
  },
  {
    id: "living-room",
    title: "Salon",
    icon: "sofa-outline",
    completed: 14,
    total: 22,
  },
  {
    id: "bathroom",
    title: "Banyo",
    icon: "bathtub-outline",
    completed: 8,
    total: 15,
  },
  {
    id: "electronic",
    title: "Elektronik",
    icon: "monitor",
    completed: 10,
    total: 18,
  },
  {
    id: "small-appliances",
    title: "Küçük Ev Aletleri",
    icon: "blender-outline",
    completed: 6,
    total: 12,
  },
] as const;

export default function DowrySummaryScreen() {
  const total = 142;
  const completed = 88;
  const missing = total - completed;
  const progress = Math.round((completed / total) * 100);

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <>
          <ScreenHeader title="Çeyiz Özeti" fallbackTo="/home" />

          <DowryGeneralStatusCard
            progress={progress}
            total={total}
            completed={completed}
            missing={missing}
          />

          <DowryCategoryStatusCard categories={[...categories]} />

          {/* <DowryShoppingSummaryCard
            total={total}
            completed={completed}
            missing={missing}
          /> */}
        </>
      </ScrollView>
    </ScreenContainer>
  );
}
