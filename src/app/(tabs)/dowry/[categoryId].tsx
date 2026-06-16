import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryDetailHeader } from "@/components/dowry/dowry-detail/DowryCategoryDetailHeader";
import { DowryCategoryFilterTabs } from "@/components/dowry/dowry-detail/DowryCategoryFilterTabs";
import { DowryChecklistCard } from "@/components/dowry/dowry-detail/DowryChecklistCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getDowryCategoryDetail } from "@/constants/dowryCategoryDetails";
import { DowryChecklistItem, DowryFilterType } from "@/types/dowry";

export default function DowryCategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = getDowryCategoryDetail(categoryId ?? "living-room");

  const [activeFilter, setActiveFilter] = useState<DowryFilterType>("all");
  const [items, setItems] = useState<DowryChecklistItem[]>(
    category?.items ?? [],
  );

  const completedCount = items.filter((item) => item.completed).length;
  const missingCount = items.length - completedCount;

  const filteredItems = useMemo(() => {
    if (activeFilter === "completed") {
      return items.filter((item) => item.completed);
    }

    if (activeFilter === "missing") {
      return items.filter((item) => !item.completed);
    }

    return items;
  }, [activeFilter, items]);

  function handleToggleItem(selectedItem: DowryChecklistItem) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id
          ? { ...item, completed: !item.completed }
          : item,
      ),
    );
  }

  function handleDeleteItem(selectedItem: DowryChecklistItem) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== selectedItem.id),
    );
  }

  if (!category) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <AppText variant="title" className="text-center text-primaryDark">
            Kategori bulunamadı
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader title={category.title} backTo="/(tabs)/dowry-summary" />

        <DowryCategoryDetailHeader
          title={category.title}
          imageKey={category.imageKey}
          completed={completedCount}
          total={items.length}
        />

        <DowryCategoryFilterTabs
          activeFilter={activeFilter}
          totalCount={items.length}
          completedCount={completedCount}
          missingCount={missingCount}
          onChangeFilter={setActiveFilter}
        />

        <View className="max-h-[400px] mb-6">
          <DowryChecklistCard
            items={filteredItems}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
          />
        </View>

        <AppButton
          title="Ürün Ekle"
          variant="primary"
          textClassName="ml-4 text-[18px] text-white"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
