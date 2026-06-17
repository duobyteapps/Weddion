import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryCategoryStatusCard } from "@/components/dowry/DowryCategoryStatusCard";
import { DowryGeneralStatusCard } from "@/components/dowry/DowryGeneralStatusCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import { getDowryCategories } from "@/services/dowryCategoryService";
import { DowryCategoryItem } from "@/types/dowry";

export default function DowrySummaryScreen() {
  const [categories, setCategories] = useState<DowryCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const total = categories.reduce((sum, category) => sum + category.total, 0);
  const completed = categories.reduce(
    (sum, category) => sum + category.completed,
    0,
  );
  const missing = total - completed;
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

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader title="Çeyiz Özeti" fallbackTo="/home" />

        <DowryGeneralStatusCard
          progress={progress}
          total={total}
          completed={completed}
          missing={missing}
        />

        {isLoading ? (
          <View className="mt-6 items-center justify-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <DowryCategoryStatusCard
            categories={categories}
            onPressCategory={handlePressCategory}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
