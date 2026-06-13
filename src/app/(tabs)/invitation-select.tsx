import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  InvitationCategory,
  InvitationCategoryFilter,
} from "@/components/invitations/select/InvitationCategoryFilter";
import { InvitationTemplate } from "@/components/invitations/select/InvitationTemplateCard";
import { InvitationTemplateList } from "@/components/invitations/select/InvitationTemplateList";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationTemplates } from "@/services/invitationTemplateService";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function InvitationSelectScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<InvitationCategory>("all");

  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handlePressTemplate = (template: InvitationTemplate) => {
    router.push({
      pathname: "/(tabs)/invitation-flow/[templateId]/edit",
      params: {
        templateId: template.id,
        returnTo: "/invitation-select",
      },
    });
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
