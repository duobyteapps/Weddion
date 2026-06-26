import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAccountManagementCard } from "@/components/dowry/DowryAccountManagementCard";
import { DowryCategoryStatusCard } from "@/components/dowry/DowryCategoryStatusCard";
import { DowryGeneralStatusCard } from "@/components/dowry/DowryGeneralStatusCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import { getDowryCategories } from "@/services/dowryCategoryService";
import { DowryCategoryItem } from "@/types/dowry";
import { formatTryCurrency } from "@/utils/formatCurrency";

export default function DowryScreen() {
  const [categories, setCategories] = useState<DowryCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const total = categories.reduce((sum, category) => sum + category.total, 0);

  const completed = categories.reduce(
    (sum, category) => sum + category.completed,
    0,
  );

  const missing = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalBudget = categories.reduce(
    (sum, category) => sum + category.budget,
    0,
  );

  const totalExpense = categories.reduce(
    (sum, category) => sum + category.expense,
    0,
  );

  const totalRemaining = totalBudget - totalExpense;

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
              total={total}
              completed={completed}
              missing={missing}
              progress={progress}
            />

            <DowryCategoryStatusCard
              categories={categories}
              onPressCategory={handlePressCategory}
            />

            <DowryAccountManagementCard
              onPress={handlePressDowryAccountManagement}
            />

            <View className="mt-4 rounded-3xl bg-card p-5 shadow-card">
              <AppText variant="serifSubtitle" className="text-primaryDark">
                Bütçe Özeti
              </AppText>

              <View className="mt-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <AppText variant="caption" className="text-textSoft">
                    Toplam Bütçe
                  </AppText>

                  <AppText variant="body" className="text-textDark">
                    {formatTryCurrency(totalBudget)}
                  </AppText>
                </View>

                <View className="flex-row items-center justify-between">
                  <AppText variant="caption" className="text-textSoft">
                    Toplam Gider
                  </AppText>

                  <AppText variant="body" className="text-textDark">
                    {formatTryCurrency(totalExpense)}
                  </AppText>
                </View>

                <View className="flex-row items-center justify-between">
                  <AppText variant="caption" className="text-textSoft">
                    Kalan Para
                  </AppText>

                  <AppText variant="body" className="text-primaryDark">
                    {formatTryCurrency(totalRemaining)}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
