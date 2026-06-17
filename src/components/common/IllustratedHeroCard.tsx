import { Image, ImageSourcePropType, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type IllustratedHeroCard = {
  title: string;
  description: string;
  image: ImageSourcePropType;
};

export function IllustratedHeroCard({
  title,
  description,
  image,
}: IllustratedHeroCard) {
  return (
    <AppCard noPadding className="flex-row items-center gap-5">
      <View className="flex-1">
        <AppText variant="serifTitle" className="!text-[20px] !leading-[23px]">
          {title}
        </AppText>

        <AppText variant="caption" className="mt-2">
          {description}
        </AppText>
      </View>
      <Image source={image} className="h-36 w-36" resizeMode="contain" />
    </AppCard>
  );
}
