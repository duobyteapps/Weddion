import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  InvitationCategory,
  InvitationCategoryFilter,
} from "@/components/invitations/select/InvitationCategoryFilter";
import { InvitationTemplate } from "@/components/invitations/select/InvitationTemplateCard";
import { InvitationTemplateList } from "@/components/invitations/select/InvitationTemplateList";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationTemplates } from "@/services/invitationTemplateService";

export default function InvitationSelectScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<InvitationCategory>("all");
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);

      const data = await getInvitationTemplates();
      setTemplates(data);
    } catch (error) {
      console.log("Davetiye şablonları alınamadı:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return templates;
    }

    return templates.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, templates]);

  function toggleFavorite(id: string) {
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
  }

  function handlePressTemplate(template: InvitationTemplate) {
    router.push({
      pathname: "/invitation-flow/[templateId]/edit",
      params: {
        templateId: template.id,
      },
    });
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <InvitationTemplateList
        templates={filteredTemplates}
        onPressTemplate={handlePressTemplate}
        onFavoritePress={toggleFavorite}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Davetiye Seç"
              description="Tarzınıza uygun davetiyeyi seçin ve kişiselleştirin."
            />

            <InvitationCategoryFilter
              selectedCategory={selectedCategory}
              onChangeCategory={setSelectedCategory}
            />

            {loading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator color="#7C3AED" />

                <AppText variant="caption" className="mt-3 text-textMuted">
                  Davetiyeler yükleniyor...
                </AppText>
              </View>
            ) : null}
          </>
        }
      />
    </ScreenContainer>
  );
}
