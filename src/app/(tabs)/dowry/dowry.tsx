import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAccountManagementCard } from "@/components/dowry/DowryAccountManagementCard";
import { DowryCategoryStatusCard } from "@/components/dowry/DowryCategoryStatusCard";
import { DowryGeneralStatusCard } from "@/components/dowry/DowryGeneralStatusCard";
import { DowryShoppingSummaryCard } from "@/components/dowry/DowryShoppingSummaryCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import { getDowryCategories } from "@/services/dowryCategoryService";
import { DowryCategoryItem } from "@/types/dowry";

export default function DowryScreen() {
  const [categories, setCategories] = useState<DowryCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const total = categories.reduce((sum, category) => sum + category.total, 0);

  const completed = categories.reduce(
    (sum, category) => sum + category.completed,
    0,
  );

  const missing = total - completed;

  const budget = categories.reduce((sum, category) => sum + category.budget, 0);

  const expense = categories.reduce(
    (sum, category) => sum + category.expense,
    0,
  );

  const remaining = budget - expense;

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getDowryCategories();

      setCategories(data);
    } catch (error) {
      console.log("Çeyiz kategorileri getirilemedi:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories]),
  );

  function handlePressCategory(category: { id: string }) {
    router.push({
      pathname: "/dowry/[categoryId]",
      params: {
        categoryId: category.id,
      },
    });
  }

  function handlePressDowryAccountManagement() {
    router.push("/(tabs)/dowry-account-management");
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-24"
      >
        <ScreenHeader
          title="Çeyiz Defterim"
          description="Çeyiz listenizi kategori kategori takip edin."
          backTo="/(tabs)/home"
        />

        {isLoading ? (
          <View className="mt-16 items-center justify-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <View>
            <DowryGeneralStatusCard
              progress={progress}
              budget={budget}
              expense={expense}
              remaining={remaining}
            />

            <DowryCategoryStatusCard
              categories={categories}
              onPressCategory={handlePressCategory}
            />

            <DowryShoppingSummaryCard
              total={total}
              completed={completed}
              missing={missing}
            />

            <DowryAccountManagementCard
              onPress={handlePressDowryAccountManagement}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
