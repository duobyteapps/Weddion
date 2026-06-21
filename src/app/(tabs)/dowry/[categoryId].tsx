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

import { getDowryCategories } from "@/services/dowryCategoryService";
import {
  deleteUserDowryItem,
  getUserDowryItems,
  toggleUserDowryItemCompleted,
} from "@/services/dowryItemService";

import {
  DowryCategoryImageKey,
  DowryCategoryItem,
  DowryChecklistItem,
  DowryFilterType,
  UserDowryItem,
} from "@/types/dowry";

const dowryCategoryImageKeys: DowryCategoryImageKey[] = [
  "living-room",
  "bedroom",
  "kitchen",
  "bathroom",
  "home-decoration",
  "technology",
  "other",
];

function getCategoryImageKey(slug: string): DowryCategoryImageKey {
  if (dowryCategoryImageKeys.includes(slug as DowryCategoryImageKey)) {
    return slug as DowryCategoryImageKey;
  }

  return "other";
}

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

  const categorySlug = categoryId ?? "";

  const [category, setCategory] = useState<DowryCategoryItem | null>(null);
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

  const fetchCategoryDetail = useCallback(async () => {
    if (!categorySlug) {
      setCategory(null);
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [categories, dowryItems] = await Promise.all([
        getDowryCategories(),
        getUserDowryItems(categorySlug),
      ]);

      const currentCategory =
        categories.find((item) => item.id === categorySlug) ??
        categories.find((item) => item.slug === categorySlug) ??
        null;

      setCategory(currentCategory);
      setItems(dowryItems.map(mapDowryItemToChecklistItem));
    } catch (error) {
      console.log("Çeyiz kategori detayı getirilemedi:", error);
      setCategory(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug]);

  useFocusEffect(
    useCallback(() => {
      fetchCategoryDetail();
    }, [fetchCategoryDetail]),
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

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!category) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <AppText variant="title" className="text-center text-primaryDark">
            Kategori bulunamadı
          </AppText>

          <AppButton
            title="Çeyiz Defterine Dön"
            className="mt-5"
            onPress={() => router.push("/(tabs)/dowry/dowry")}
          />
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
        <ScreenHeader title={category.title} backTo="/(tabs)/dowry/dowry" />

        <DowryCategoryDetailHeader
          title={category.title}
          imageKey={getCategoryImageKey(category.slug)}
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

        {items.length === 0 ? (
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
