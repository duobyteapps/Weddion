import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryDetailHeader } from "@/components/dowry/dowry-detail/DowryCategoryDetailHeader";
import { DowryCategoryFilterTabs } from "@/components/dowry/dowry-detail/DowryCategoryFilterTabs";
import { DowryChecklistCard } from "@/components/dowry/dowry-detail/DowryChecklistCard";
import { EmptyDowryItems } from "@/components/dowry/dowry-detail/EmptyDowryItems";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { Colors } from "@/constants/Colors";

import {
  getDowryCategories,
  upsertDowryCategoryBudget,
} from "@/services/dowryCategoryService";
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
import { formatTryCurrency } from "@/utils/formatCurrency";

const dowryCategoryImageKeys: DowryCategoryImageKey[] = [
  "living-room",
  "bedroom",
  "kitchen",
  "bathroom",
  "home-decoration",
  "technology",
  "other",
];

const CHECKLIST_SCROLL_ITEM_LIMIT = 5;
const CHECKLIST_MAX_HEIGHT = 400;

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

function parseBudgetValue(value: string) {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function getSafePrice(value: number | null | undefined) {
  if (!value || value < 0) {
    return 0;
  }

  return value;
}

function getSafeQuantity(value: number | null | undefined) {
  if (!value || value < 1) {
    return 1;
  }

  return value;
}

type BudgetSummaryRowProps = {
  label: string;
  value: string;
  highlighted?: boolean;
};

function BudgetSummaryRow({
  label,
  value,
  highlighted = false,
}: BudgetSummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <AppText variant="caption" className="text-textSoft">
        {label}
      </AppText>

      <AppText
        variant="captionStrong"
        className={highlighted ? "text-primaryDark" : "text-textDark"}
      >
        {value}
      </AppText>
    </View>
  );
}

export default function DowryCategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const categorySlug = categoryId ?? "";

  const [category, setCategory] = useState<DowryCategoryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<DowryFilterType>("all");
  const [items, setItems] = useState<DowryChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState("");
  const [isBudgetSaving, setIsBudgetSaving] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isBudgetSavedMessageVisible, setIsBudgetSavedMessageVisible] =
    useState(false);

  const completedCount = items.filter((item) => item.completed).length;
  const missingCount = items.length - completedCount;

  const categoryBudget = parseBudgetValue(budgetInput);

  const categoryExpense = items.reduce((sum, item) => {
    const quantity = getSafeQuantity(item.quantity);
    const price = getSafePrice(item.price);

    return sum + price * quantity;
  }, 0);

  const categoryRemaining = categoryBudget - categoryExpense;
  const isBudgetOverLimit = categoryBudget > 0 && categoryRemaining < 0;
  const hasSavedBudget = Boolean(category && category.budget > 0);

  const budgetButtonTitle = isBudgetSavedMessageVisible
    ? "Bütçe Kaydedildi"
    : hasSavedBudget
      ? "Güncelle"
      : "Kayıt";

  const filteredItems = useMemo(() => {
    if (activeFilter === "completed") {
      return items.filter((item) => item.completed);
    }

    if (activeFilter === "missing") {
      return items.filter((item) => !item.completed);
    }

    return items;
  }, [activeFilter, items]);

  const shouldScrollChecklist =
    filteredItems.length > CHECKLIST_SCROLL_ITEM_LIMIT;

  const fetchCategoryDetail = useCallback(async () => {
    if (!categorySlug) {
      setCategory(null);
      setItems([]);
      setBudgetInput("");
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
      setBudgetInput(
        currentCategory && currentCategory.budget > 0
          ? String(currentCategory.budget)
          : "",
      );
    } catch (error) {
      console.log("Çeyiz kategori detayı getirilemedi:", error);
      setCategory(null);
      setItems([]);
      setBudgetInput("");
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug]);

  useFocusEffect(
    useCallback(() => {
      fetchCategoryDetail();
    }, [fetchCategoryDetail]),
  );

  async function handleSaveBudget() {
    if (!categorySlug || isBudgetSaving) {
      return;
    }

    try {
      setIsBudgetSaving(true);
      setIsBudgetSavedMessageVisible(false);

      const nextBudget = parseBudgetValue(budgetInput);

      const savedBudget = await upsertDowryCategoryBudget({
        categorySlug,
        budget: nextBudget,
      });

      setBudgetInput(savedBudget > 0 ? String(savedBudget) : "");

      setCategory((currentCategory) => {
        if (!currentCategory) {
          return currentCategory;
        }

        return {
          ...currentCategory,
          budget: savedBudget,
          expense: categoryExpense,
          remaining: savedBudget - categoryExpense,
        };
      });

      setIsBudgetSavedMessageVisible(true);

      setTimeout(() => {
        setIsBudgetSavedMessageVisible(false);
      }, 1800);

      console.log("Çeyiz bütçesi kaydedildi:", savedBudget);
    } catch (error) {
      console.log("Çeyiz bütçesi kaydedilemedi:", error);
    } finally {
      setIsBudgetSaving(false);
    }
  }

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
        contentContainerClassName="pb-32"
      >
        <ScreenHeader title={category.title} backTo="/(tabs)/dowry/dowry" />

        <DowryCategoryDetailHeader
          title={category.title}
          imageKey={getCategoryImageKey(category.slug)}
          completed={completedCount}
          total={items.length}
        />

        <AppCard className="mt-4">
          <Pressable
            onPress={() => setIsBudgetOpen((currentValue) => !currentValue)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-1 pr-4">
              <AppText variant="captionStrong" className="text-textSoft">
                Kalan Bütçe
              </AppText>
            </View>

            <View className="flex-row items-center gap-3">
              <AppText variant="captionStrong" className="text-primaryDark">
                {isBudgetOverLimit
                  ? `-${formatTryCurrency(Math.abs(categoryRemaining))}`
                  : formatTryCurrency(categoryRemaining)}
              </AppText>

              <View className="h-9 w-9 items-center justify-center rounded-full bg-primarySoft">
                <MaterialCommunityIcons
                  name={isBudgetOpen ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={Colors.primaryDark}
                />
              </View>
            </View>
          </Pressable>

          {isBudgetOpen ? (
            <View className="mt-5">
              <AppInput
                label="Kategori Bütçesi"
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="Örn. 50000"
                keyboardType="decimal-pad"
                editable={!isBudgetSaving}
                inputClassName="text-textDark"
              />

              <View className="mt-5 rounded-xl bg-background px-4 py-4">
                <BudgetSummaryRow
                  label="Bütçe"
                  value={formatTryCurrency(categoryBudget)}
                />

                <View className="my-3 h-px bg-border" />

                <BudgetSummaryRow
                  label="Gider"
                  value={formatTryCurrency(categoryExpense)}
                />

                <View className="my-3 h-px bg-border" />

                <BudgetSummaryRow
                  label={isBudgetOverLimit ? "Bütçe Aşımı" : "Kalan"}
                  value={formatTryCurrency(
                    isBudgetOverLimit
                      ? Math.abs(categoryRemaining)
                      : categoryRemaining,
                  )}
                  highlighted
                />
              </View>

              <AppButton
                title={budgetButtonTitle}
                loading={isBudgetSaving}
                disabled={isBudgetSaving}
                className="mt-5"
                onPress={handleSaveBudget}
              />
            </View>
          ) : null}
        </AppCard>

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
            <View className="mb-6">
              <DowryChecklistCard
                items={filteredItems}
                shouldScroll={shouldScrollChecklist}
                maxListHeight={CHECKLIST_MAX_HEIGHT}
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
