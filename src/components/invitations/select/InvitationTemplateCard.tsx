import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { InvitationCategory } from "./InvitationCategoryFilter";

export type InvitationTemplate = {
  id: string;
  title: string;
  category: InvitationCategory;
  categoryTitle: string;
  imageUrl: string;
  isFavorite?: boolean;
};

type Props = {
  template: InvitationTemplate;
  onPress?: () => void;
  onFavoritePress?: () => void;
};

export function InvitationTemplateCard({
  template,
  onPress,
  onFavoritePress,
}: Props) {
  return (
    <Pressable onPress={onPress}>
      <AppCard
        noPadding
        noMargin
        className="overflow-hidden bg-white py-2 !px-2"
      >
        <View className="relative">
          <Image
            source={{ uri: template.imageUrl }}
            resizeMode="cover"
            className="h-44 w-full rounded-2xl"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(event) => {
              event.stopPropagation();
              onFavoritePress?.();
            }}
            className="absolute -bottom-4 right-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name={template.isFavorite ? "heart" : "heart-outline"}
              size={22}
              color="#7C3AED"
            />
          </TouchableOpacity>
        </View>

        <View className="px-2 pb-2 pt-3">
          <AppText
            variant="serifTitle"
            numberOfLines={1}
            className="!text-[14px] !leading-[16px]"
          >
            {template.title}
          </AppText>

          <View className="mt-2 self-start rounded-xl bg-primarySoft px-3 py-1">
            <AppText variant="caption" className="!text-primaryDark">
              {template.categoryTitle}
            </AppText>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
