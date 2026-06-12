import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  InvitationCategory,
  InvitationCategoryFilter,
} from "@/components/invitations/select/InvitationCategoryFilter";
import {
  InvitationTemplate,
  InvitationTemplateCard,
} from "@/components/invitations/select/InvitationTemplateCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getInvitationTemplates } from "@/services/invitationTemplateService";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

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

  return (
    <ScreenContainer className="flex-1 bg-background">
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
        columnWrapperClassName="justify-between"
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
        renderItem={({ item }) => (
          <View className="mb-4 w-[48.5%]">
            <InvitationTemplateCard
              template={item}
              onPress={() => {}}
              onFavoritePress={() => toggleFavorite(item.id)}
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
}
