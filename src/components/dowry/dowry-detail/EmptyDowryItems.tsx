import { Image, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type EmptyDowryItemsProps = {
  categoryName?: string;
  onAddPress: () => void;
};

export function EmptyDowryItems({
  categoryName,
  onAddPress,
}: EmptyDowryItemsProps) {
  return (
    <AppCard className="mt-6 min-h-[520px] items-center justify-center px-6 py-10">
      <Image
        source={require("@/assets/images/illustration/dowry/empty-dowry.png")}
        className="h-[210px] w-[260px]"
        resizeMode="contain"
      />

      <View className="mt-6 items-center">
        <AppText variant="title" className="text-center">
          Henüz ürün eklenmedi
        </AppText>

        <AppText
          variant="body"
          className="mt-3 max-w-[310px] text-center !text-[14px] !leading-[23px]"
        >
          {categoryName
            ? `${categoryName} için aldığınız ürünleri ekleyerek çeyiz listenizi takip etmeye başlayın.`
            : "Aldığınız ürünleri ekleyerek çeyiz listenizi takip etmeye başlayın."}
        </AppText>
      </View>

      <AppButton
        title="Ürün Ekle"
        className="mt-8 w-full max-w-[300px]"
        onPress={onAddPress}
      />
    </AppCard>
  );
}
