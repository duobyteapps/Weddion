import { router, useLocalSearchParams, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAddProductFormCard } from "@/components/dowry/add-product/DowryAddProductFormCard";
import { DowryAddProductHeader } from "@/components/dowry/add-product/DowryAddProductHeader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { createUserDowryItemByCategorySlug } from "@/services/dowryItemService";

const categoryLabels: Record<string, string> = {
  kitchen: "Mutfak",
  bedroom: "Yatak Odası",
  bathroom: "Banyo",
  "living-room": "Oturma Odası",
  "home-decoration": "Ev Dekorasyon",
  technology: "Teknolojik Aletler",
  other: "Diğer",
};

export default function DowryAddProductScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();

  const categorySlug = params.categoryId ? String(params.categoryId) : "";

  const categoryDetailHref = useMemo<Href>(() => {
    if (categorySlug) {
      return {
        pathname: "/dowry/[categoryId]",
        params: {
          categoryId: categorySlug,
        },
      };
    }

    return "/(tabs)/dowry-summary";
  }, [categorySlug]);

  const initialCategoryName = useMemo(() => {
    if (params.categoryName) return String(params.categoryName);

    if (categorySlug && categoryLabels[categorySlug]) {
      return categoryLabels[categorySlug];
    }

    return "Mutfak";
  }, [categorySlug, params.categoryName]);

  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName] = useState(initialCategoryName);
  const [quantity, setQuantity] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!productName.trim()) {
      return;
    }

    if (!categorySlug) {
      console.log("Kategori bilgisi bulunamadı.");
      return;
    }

    try {
      setLoading(true);

      await createUserDowryItemByCategorySlug({
        categorySlug,
        title: productName.trim(),
        brandName: brandName.trim(),
        quantity,
        completed,
      });

      router.replace(categoryDetailHref);
    } catch (error) {
      console.log("Çeyiz ürünü eklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader title="Yeni Ürün Ekle" fallbackTo={categoryDetailHref} />

        <DowryAddProductHeader />

        <DowryAddProductFormCard
          productName={productName}
          brandName={brandName}
          quantity={quantity}
          completed={completed}
          loading={loading}
          onChangeProductName={setProductName}
          onChangeBrandName={setBrandName}
          onChangeQuantity={setQuantity}
          onChangeCompleted={setCompleted}
          onSave={handleSave}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
