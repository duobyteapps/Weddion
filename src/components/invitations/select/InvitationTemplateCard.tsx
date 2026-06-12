import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
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
  const [carouselWidth, setCarouselWidth] = useState(0);

  const images = useMemo(() => {
    return [template.imageUrl, template.contentImageUrl].filter(
      (item): item is string => Boolean(item),
    );
  }, [template.imageUrl, template.contentImageUrl]);

  function handleCarouselLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;

    if (width > 0 && width !== carouselWidth) {
      setCarouselWidth(width);
    }
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!carouselWidth) {
      return;
    }

    const index = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);

    setActiveImageIndex(index);
  }

  return (
    <AppCard noPadding noMargin className="overflow-hidden bg-white py-2 !px-2">
      <View className="relative">
        <View
          className="h-44 overflow-hidden rounded-2xl"
          onLayout={handleCarouselLayout}
        >
          {carouselWidth > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(item, index) => `${template.id}-${item}-${index}`}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              directionalLockEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Pressable
                  onPress={onPress}
                  style={{ width: carouselWidth }}
                  className="h-44"
                >
                  <Image
                    source={{ uri: item }}
                    resizeMode="cover"
                    className="h-44 w-full"
                  />
                </Pressable>
              )}
            />
          ) : (
            <View className="h-44 w-full bg-primarySoft" />
          )}

          {images.length > 1 ? (
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.38)"]}
              locations={[0, 0.45, 1]}
              pointerEvents="none"
              style={styles.imageGradient}
            >
              <View className="flex-row items-center justify-center gap-1.5 pb-3">
                {images.map((_, index) => (
                  <View
                    key={`${template.id}-indicator-${index}`}
                    className={`h-1.5 rounded-full ${
                      activeImageIndex === index
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/65"
                    }`}
                  />
                ))}
              </View>
            </LinearGradient>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onFavoritePress}
          className="absolute -bottom-4 right-3 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name={template.isFavorite ? "heart" : "heart-outline"}
            size={22}
            color="#7C3AED"
          />
        </TouchableOpacity>
      </View>

      <Pressable onPress={onPress} className="px-2 pb-2 pt-3">
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
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 35,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
