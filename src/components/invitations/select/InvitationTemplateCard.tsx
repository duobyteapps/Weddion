import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { InvitationCategory } from "./InvitationCategoryFilter";

export type InvitationTemplate = {
  id: string;
  title: string;
  category: InvitationCategory;
  categoryTitle: string;
  imageUrl: string;
  contentImageUrl?: string | null;
  editableImageUrl?: string | null;
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);

  const images = useMemo(() => {
    return [template.imageUrl, template.contentImageUrl].filter(
      (item): item is string => Boolean(item),
    );
  }, [template.contentImageUrl, template.imageUrl]);

  const handleImageLayout = (event: LayoutChangeEvent) => {
    setImageWidth(event.nativeEvent.layout.width);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!imageWidth) {
      return;
    }

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / imageWidth,
    );

    setActiveImageIndex(nextIndex);
  };

  return (
    <Pressable onPress={onPress}>
      <AppCard
        noPadding
        noMargin
        className="overflow-hidden bg-white py-2 !px-2"
      >
        <View className="relative" onLayout={handleImageLayout}>
          <ScrollView
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            className="h-44 rounded-2xl"
          >
            {images.map((imageUrl, index) => (
              <View
                key={`${template.id}-${imageUrl}-${index}`}
                style={{ width: imageWidth || undefined }}
                className="h-44"
              >
                <Image
                  source={{ uri: imageUrl }}
                  resizeMode="cover"
                  className="h-44 w-full rounded-2xl"
                />
              </View>
            ))}
          </ScrollView>

          {images.length > 1 ? (
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1.5">
              {images.map((_, index) => (
                <View
                  key={`${template.id}-dot-${index}`}
                  className={`h-1.5 rounded-full ${
                    activeImageIndex === index
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </View>
          ) : null}

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
