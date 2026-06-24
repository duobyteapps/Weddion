import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  InvitationCategory,
  InvitationCategoryFilter,
  InvitationCategoryItem,
} from "@/components/invitations/select/InvitationCategoryFilter";
import { InvitationTemplate } from "@/components/invitations/select/InvitationTemplateCard";
import { InvitationTemplateList } from "@/components/invitations/select/InvitationTemplateList";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { MAX_USER_INVITATION_COUNT } from "@/constants/invitationLimits";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { getCurrentUserInvitationCount } from "@/services/invitationService";
import { getInvitationTemplateCategories } from "@/services/invitationTemplateCategoryService";
import { getInvitationTemplates } from "@/services/invitationTemplateService";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

const INVITATION_TEMPLATE_PAGE_SIZE = 10;

export default function InvitationSelectScreen() {
  const appRouter = useAppNavigation();

  const [selectedCategory, setSelectedCategory] =
    useState<InvitationCategory>("all");

  const [categories, setCategories] = useState<InvitationCategoryItem[]>([]);
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { showAlert } = useAppAlert();

  const fetchCategories = useCallback(async () => {
    try {
      const categoryList = await getInvitationTemplateCategories();

      setCategories(categoryList);
    } catch (error) {
      console.log("Davetiye kategorileri alınamadı:", error);
    }
  }, []);

  const fetchTemplates = useCallback(
    async (targetPage = 0, replace = true) => {
      try {
        if (targetPage === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const data = await getInvitationTemplates({
          page: targetPage,
          pageSize: INVITATION_TEMPLATE_PAGE_SIZE + 1,
          category: selectedCategory,
        });

        const visibleTemplates = data.slice(0, INVITATION_TEMPLATE_PAGE_SIZE);

        setTemplates((prev) =>
          replace ? visibleTemplates : [...prev, ...visibleTemplates],
        );

        setPage(targetPage);
        setHasMore(data.length > INVITATION_TEMPLATE_PAGE_SIZE);
      } catch (error) {
        console.log("Davetiye şablonları alınamadı:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setTemplates([]);
    setPage(0);
    setHasMore(true);
    fetchTemplates(0, true);
  }, [fetchTemplates]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    fetchTemplates(page + 1, false);
  };

  const toggleFavorite = (id: string) => {
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
  };

  const handlePressTemplate = async (template: InvitationTemplate) => {
    try {
      const invitationCount = await getCurrentUserInvitationCount();

      if (invitationCount >= MAX_USER_INVITATION_COUNT) {
        showAlert({
          title: "Davetiye limiti doldu",
          message: `Her hesap en fazla ${MAX_USER_INVITATION_COUNT} davetiye oluşturabilir. Yeni davetiye oluşturmak için mevcut davetiyelerden birini silebilirsiniz.`,
          type: "warning",
          confirmText: "Tamam",
        });
        return;
      }

      appRouter.push({
        pathname: "/(tabs)/invitation-flow/[templateId]/edit",
        params: {
          templateId: template.id,
        },
      });
    } catch (error) {
      console.log("Davetiye limiti kontrol edilemedi:", error);

      showAlert({
        title: "İşlem yapılamadı",
        message:
          "Davetiye oluşturma hakkınız kontrol edilirken bir sorun oluştu.",
        type: "error",
        confirmText: "Tamam",
      });
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <InvitationTemplateList
        templates={loading ? [] : templates}
        onPressTemplate={handlePressTemplate}
        onFavoritePress={toggleFavorite}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Dijital Davetiyeni Seç"
              description="Tarzına uygun davetiyeni seçin."
            />

            <InvitationCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onChangeCategory={setSelectedCategory}
            />

            {loading && (
              <View className="mt-8">
                <ActivityIndicator />
              </View>
            )}
          </>
        }
        ListFooterComponent={
          !loading && hasMore ? (
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loadingMore}
              onPress={handleLoadMore}
              className="mt-5 mb-8 h-12 items-center justify-center rounded-2xl bg-primary"
            >
              {loadingMore ? (
                <ActivityIndicator />
              ) : (
                <AppText className="font-semibold text-white">
                  Daha Fazla Yükle
                </AppText>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    </ScreenContainer>
  );
}
