import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryDetailHeader } from "@/components/dowry/dowry-detail/DowryCategoryDetailHeader";
import { DowryCategoryFilterTabs } from "@/components/dowry/dowry-detail/DowryCategoryFilterTabs";
import { DowryChecklistCard } from "@/components/dowry/dowry-detail/DowryChecklistCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
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
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <AppText variant="title" className="text-center text-primaryDark">
            Kategori bulunamadı
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 bg-background">
        <ScrollView
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
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

          <DowryChecklistCard
            items={filteredItems}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
          />
        </ScrollView>

        <View className=" bg-background px-5 pb-5 pt-3">
          <Pressable className="h-16 flex-row items-center justify-center rounded-2xl bg-primary">
            <MaterialCommunityIcons
              name="plus"
              size={34}
              color={Colors.white}
            />

            <AppText variant="subtitle" className="ml-4 text-[18px] text-white">
              Ürün Ekle
            </AppText>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
