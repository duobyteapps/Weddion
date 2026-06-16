import { router, useLocalSearchParams, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAddProductFormCard } from "@/components/dowry/add-product/DowryAddProductFormCard";
import { DowryAddProductHeader } from "@/components/dowry/add-product/DowryAddProductHeader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

const categoryLabels: Record<string, string> = {
  kitchen: "Mutfak",
  bedroom: "Yatak Odası",
  bathroom: "Banyo",
  livingRoom: "Oturma Odası",
  decoration: "Ev Dekorasyon",
  technology: "Teknolojik Aletler",
  other: "Diğer",
};

export default function DowryAddProductScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();

  const fallbackTo = useMemo<Href>(() => {
    if (params.categoryId) {
      return {
        pathname: "/dowry/[categoryId]",
        params: {
          categoryId: String(params.categoryId),
        },
      };
    }

    return "/home";
  }, [params.categoryId]);

  const initialCategoryName = useMemo(() => {
    if (params.categoryName) return String(params.categoryName);

    if (params.categoryId && categoryLabels[String(params.categoryId)]) {
      return categoryLabels[String(params.categoryId)];
    }

    return "Mutfak";
  }, [params.categoryId, params.categoryName]);

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

    try {
      setLoading(true);

      const newProduct = {
        id: Date.now().toString(),
        title: productName.trim(),
        brandName: brandName.trim(),
        categoryId: params.categoryId ? String(params.categoryId) : undefined,
        categoryName,
        quantity,
        completed,
      };

      console.log("Yeni çeyiz ürünü:", newProduct);

      router.back();
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
        <ScreenHeader title="Yeni Ürün Ekle" fallbackTo={fallbackTo} />

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
