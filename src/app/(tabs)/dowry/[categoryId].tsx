import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryDetailHeader } from "@/components/dowry/dowry-detail/DowryCategoryDetailHeader";
import { DowryCategoryFilterTabs } from "@/components/dowry/dowry-detail/DowryCategoryFilterTabs";
import { DowryChecklistCard } from "@/components/dowry/dowry-detail/DowryChecklistCard";
import { EmptyDowryItems } from "@/components/dowry/dowry-detail/EmptyDowryItems";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import { getDowryCategoryDetail } from "@/constants/dowryCategoryDetails";
import {
  deleteUserDowryItem,
  getUserDowryItems,
  toggleUserDowryItemCompleted,
} from "@/services/dowryItemService";
import {
  DowryChecklistItem,
  DowryFilterType,
  UserDowryItem,
} from "@/types/dowry";

function mapDowryItemToChecklistItem(item: UserDowryItem): DowryChecklistItem {
  return {
    id: item.id,
    title: item.title,
    brandName: item.brandName,
    quantity: item.quantity,
    price: item.price,
    completed: item.completed,
  };
}

export default function DowryCategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const categorySlug = categoryId ?? "living-room";
  const category = getDowryCategoryDetail(categorySlug);

  const [activeFilter, setActiveFilter] = useState<DowryFilterType>("all");
  const [items, setItems] = useState<DowryChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);

      const dowryItems = await getUserDowryItems(categorySlug);
      const formattedItems = dowryItems.map(mapDowryItemToChecklistItem);

      setItems(formattedItems);
    } catch (error) {
      console.log("Çeyiz ürünleri getirilemedi:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  function handleAddProduct() {
    router.push({
      pathname: "/dowry/dowry-add-product",
      params: {
        categoryId: categorySlug,
        categoryName: category?.title ?? "",
      },
    });
  }

  async function handleToggleItem(selectedItem: DowryChecklistItem) {
    const nextCompleted = !selectedItem.completed;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id
          ? { ...item, completed: nextCompleted }
          : item,
      ),
    );

    try {
      await toggleUserDowryItemCompleted({
        itemId: selectedItem.id,
        completed: nextCompleted,
      });
    } catch (error) {
      console.log("Çeyiz ürünü güncellenemedi:", error);

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === selectedItem.id
            ? { ...item, completed: selectedItem.completed }
            : item,
        ),
      );
    }
  }

  function handleUpdateItem(selectedItem: DowryChecklistItem) {
    router.push({
      pathname: "/dowry/dowry-add-product",
      params: {
        categoryId: categorySlug,
        categoryName: category?.title ?? "",
        itemId: selectedItem.id,
        productName: selectedItem.title,
        brandName: selectedItem.brandName ?? "",
        quantity: String(selectedItem.quantity ?? 1),
        price:
          typeof selectedItem.price === "number"
            ? String(selectedItem.price)
            : "",
        completed: String(selectedItem.completed),
        mode: "edit",
      },
    });
  }

  async function handleDeleteItem(selectedItem: DowryChecklistItem) {
    try {
      await deleteUserDowryItem(selectedItem.id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== selectedItem.id),
      );
    } catch (error) {
      console.log("Çeyiz ürünü silinemedi:", error);
    }
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
        contentContainerClassName="pb-10"
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

        {isLoading ? (
          <View className="mt-6 items-center justify-center py-8">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <EmptyDowryItems
            categoryName={category.title}
            onAddPress={handleAddProduct}
          />
        ) : (
          <>
            <View className="mb-6 max-h-[400px]">
              <DowryChecklistCard
                items={filteredItems}
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
              />
            </View>

            <AppButton title="Ürün Ekle" onPress={handleAddProduct} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
