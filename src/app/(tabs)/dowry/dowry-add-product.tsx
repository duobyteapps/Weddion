import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAddProductFormCard } from "@/components/dowry/add-product/DowryAddProductFormCard";
import { DowryAddProductHeader } from "@/components/dowry/add-product/DowryAddProductHeader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  createUserDowryItemByCategorySlug,
  updateUserDowryItem,
} from "@/services/dowryItemService";

const categoryLabels: Record<string, string> = {
  kitchen: "Mutfak",
  bedroom: "Yatak Odası",
  bathroom: "Banyo",
  "living-room": "Oturma Odası",
  "home-decoration": "Ev Dekorasyon",
  technology: "Teknolojik Aletler",
  other: "Diğer",
};

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default function DowryAddProductScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string | string[];
    categoryName?: string | string[];
    itemId?: string | string[];
    productName?: string | string[];
    brandName?: string | string[];
    quantity?: string | string[];
    completed?: string | string[];
    mode?: string | string[];
  }>();

  const categorySlug = getParamValue(params.categoryId);
  const itemId = getParamValue(params.itemId);
  const mode = getParamValue(params.mode);
  const isEditMode = mode === "edit" && !!itemId;

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
    const categoryNameParam = getParamValue(params.categoryName);

    if (categoryNameParam) {
      return categoryNameParam;
    }

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

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const productNameParam = getParamValue(params.productName);
    const brandNameParam = getParamValue(params.brandName);
    const quantityParam = Number(getParamValue(params.quantity));
    const completedParam = getParamValue(params.completed);

    setProductName(productNameParam);
    setBrandName(brandNameParam);
    setQuantity(
      Number.isNaN(quantityParam) || quantityParam < 1 ? 1 : quantityParam,
    );
    setCompleted(completedParam === "true");
  }, [
    isEditMode,
    params.productName,
    params.brandName,
    params.quantity,
    params.completed,
  ]);

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

      if (isEditMode) {
        await updateUserDowryItem({
          itemId,
          title: productName.trim(),
          brandName: brandName.trim(),
          quantity,
          completed,
        });
      } else {
        await createUserDowryItemByCategorySlug({
          categorySlug,
          title: productName.trim(),
          brandName: brandName.trim(),
          quantity,
          completed,
        });
      }

      router.replace(categoryDetailHref);
    } catch (error) {
      console.log(
        isEditMode ? "Çeyiz ürünü güncellenemedi:" : "Çeyiz ürünü eklenemedi:",
        error,
      );
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
        <ScreenHeader
          title={isEditMode ? "Ürünü Güncelle" : "Yeni Ürün Ekle"}
          fallbackTo={categoryDetailHref}
        />

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
