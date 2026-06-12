// src/app/(tabs)/invitation-select.tsx

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
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

const initialTemplates: InvitationTemplate[] = [
  {
    id: "1",
    title: "Lavanta Bahçesi",
    category: "flower",
    categoryTitle: "Çiçekli",
    image: require("@/assets/images/invitations/davetiye-1.png"),
    isFavorite: true,
  },
  {
    id: "2",
    title: "Lila Romantizm",
    category: "flower",
    categoryTitle: "Çiçekli",
    image: require("@/assets/images/invitations/davetiye-2.png"),
    isFavorite: false,
  },
  {
    id: "3",
    title: "Soft Zarafet",
    category: "minimal",
    categoryTitle: "Minimal",
    image: require("@/assets/images/invitations/davetiye-3.png"),
    isFavorite: false,
  },
  {
    id: "4",
    title: "Mor Bahar",
    category: "flower",
    categoryTitle: "Çiçekli",
    image: require("@/assets/images/invitations/davetiye-4.png"),
    isFavorite: false,
  },
  {
    id: "5",
    title: "İnci Dokunuş",
    category: "classic",
    categoryTitle: "Klasik",
    image: require("@/assets/images/invitations/davetiye-5.png"),
    isFavorite: false,
  },
  {
    id: "6",
    title: "Sade Aşk",
    category: "minimal",
    categoryTitle: "Minimal",
    image: require("@/assets/images/invitations/davetiye-6.png"),
    isFavorite: false,
  },
];

export default function InvitationSelectScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<InvitationCategory>("all");

  const [templates, setTemplates] =
    useState<InvitationTemplate[]>(initialTemplates);

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
