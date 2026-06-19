import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  InvitationCategory,
  InvitationCategoryFilter,
} from "@/components/invitations/select/InvitationCategoryFilter";
import { InvitationTemplate } from "@/components/invitations/select/InvitationTemplateCard";
import { InvitationTemplateList } from "@/components/invitations/select/InvitationTemplateList";
import { useAppAlert } from "@/components/ui/AppAlert";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { MAX_USER_INVITATION_COUNT } from "@/constants/invitationLimits";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { getCurrentUserInvitationCount } from "@/services/invitationService";
import { getInvitationTemplates } from "@/services/invitationTemplateService";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function InvitationSelectScreen() {
  const appRouter = useAppNavigation();

  const [selectedCategory, setSelectedCategory] =
    useState<InvitationCategory>("all");

  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const { showAlert } = useAppAlert();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const data = await getInvitationTemplates();

      setTemplates(data);
    } catch (error) {
      console.log("Davetiye şablonları alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return templates;
    }

    return templates.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, templates]);

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
        templates={loading ? [] : filteredTemplates}
        onPressTemplate={handlePressTemplate}
        onFavoritePress={toggleFavorite}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Dijital Davetiyeni Seç"
              description="Tarzına uygun davetiyeni seçin."
            />

            <InvitationCategoryFilter
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
      />
    </ScreenContainer>
  );
}
