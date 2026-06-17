import { Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppCheckbox } from "@/components/ui/AppCheckbox";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { DowryQuantityStepper } from "./DowryQuantityStepper";

type Props = {
  productName: string;
  brandName: string;
  quantity: number;
  completed: boolean;
  loading?: boolean;
  onChangeProductName: (value: string) => void;
  onChangeBrandName: (value: string) => void;
  onChangeQuantity: (value: number) => void;
  onChangeCompleted: (value: boolean) => void;
  onSave: () => void;
};

export function DowryAddProductFormCard({
  productName,
  brandName,
  quantity,
  completed,
  loading = false,
  onChangeProductName,
  onChangeBrandName,
  onChangeQuantity,
  onChangeCompleted,
  onSave,
}: Props) {
  const handleToggleCompleted = () => {
    onChangeCompleted(!completed);
  };

  return (
    <>
      <AppCard>
        <AppInput
          label="Ürün Adı"
          value={productName}
          onChangeText={onChangeProductName}
          placeholder="Örn: Yemek Takımı"
        />

        <AppInput
          label="Marka"
          value={brandName}
          onChangeText={onChangeBrandName}
          placeholder="Örn: Karaca"
        />

        <View className="mb-7">
          <AppText variant="caption" className="mb-2 text-textMuted">
            Adet
          </AppText>

          <DowryQuantityStepper value={quantity} onChange={onChangeQuantity} />
        </View>

        <View className="mb-2 flex-row items-center">
          <AppCheckbox checked={completed} onPress={handleToggleCompleted} />

          <Pressable className="ml-3 flex-1" onPress={handleToggleCompleted}>
            <AppText variant="body" className="text-textDark">
              Ürün satın alındı
            </AppText>
          </Pressable>
        </View>
      </AppCard>

      <AppButton title="Kaydet" loading={loading} onPress={onSave} />
    </>
  );
}
