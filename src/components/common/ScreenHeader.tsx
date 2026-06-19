import { type Href } from "expo-router";
import { View } from "react-native";

import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppText } from "@/components/ui/AppText";
import { useAppNavigation } from "@/hooks/useAppNavigation";

type ScreenHeaderProps = {
  title: string;
  description?: string;
  backTo?: Href;
  fallbackTo?: Href;
  onBackPress?: () => void;
};

export function ScreenHeader({
  title,
  description,
  backTo,
  fallbackTo = "/home",
  onBackPress,
}: ScreenHeaderProps) {
  const appRouter = useAppNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (backTo) {
      appRouter.replace(backTo);
      return;
    }

    appRouter.back(fallbackTo);
  };

  return (
    <View className="mb-8 mt-4">
      <View className="flex-row items-center justify-between">
        <View className="w-10 items-start">
          <AppBackButton onPress={handleBackPress} />
        </View>

        <View className="flex-1 items-center px-2">
          <AppText variant="serifTitle" numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </AppText>

          {description ? (
            <AppText variant="body" className="text-center">
              {description}
            </AppText>
          ) : null}
        </View>

        <View className="w-10" />
      </View>
    </View>
  );
}
