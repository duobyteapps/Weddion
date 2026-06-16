import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import {
  dowryCategoryImages,
  lavenderBranchLeft,
  lavenderBranchRight,
} from "@/constants/dowryImages";
import { DowryCategoryImageKey } from "@/types/dowry";

type Props = {
  title: string;
  imageKey: DowryCategoryImageKey;
  completed: number;
  total: number;
};

export function DowryCategoryDetailHeader({
  title,
  imageKey,
  completed,
  total,
}: Props) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const headerImage = dowryCategoryImages[imageKey];

  return (
    <View className="items-center">
      <View className="mb-4 w-full flex-row items-center justify-center">
        <Image
          source={lavenderBranchLeft}
          className="mr-3 h-24 w-24"
          resizeMode="contain"
        />

        <View className="h-28 w-28 items-center justify-center rounded-full bg-primarySoft">
          <Image
            source={headerImage}
            className="h-20 w-20"
            resizeMode="contain"
          />
        </View>

        <Image
          source={lavenderBranchRight}
          className="ml-3 h-24 w-24"
          resizeMode="contain"
        />
      </View>

      <AppText
        variant="serifTitle"
        className="mb-4 text-center text-[28px] leading-[34px] text-primaryDark"
      >
        {title}
      </AppText>

      <AppText
        variant="subtitle"
        className="mb-4 text-center text-[17px] text-primaryDark"
      >
        {completed} / {total} ürün tamamlandı
      </AppText>

      <View className="w-full flex-row items-center">
        <View className="mr-4 h-3 flex-1 overflow-hidden rounded-full bg-primaryLight">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </View>

        <AppText
          variant="subtitle"
          className="min-w-[48px] text-right text-[17px] text-primaryDark"
        >
          %{percentage}
        </AppText>
      </View>
    </View>
  );
}
