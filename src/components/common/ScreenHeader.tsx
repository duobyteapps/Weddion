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
};

export function ScreenHeader({
  title,
  description,
  backTo,
  fallbackTo = "/home",
}: ScreenHeaderProps) {
  const appRouter = useAppNavigation();

  const handleBackPress = () => {
    if (backTo) {
      appRouter.replace(backTo);
      return;
    }

    appRouter.back(fallbackTo);
  };

  return (
    <View className="relative mb-8 mt-4 justify-center">
      <AppBackButton
        onPress={handleBackPress}
        className="absolute left-0 z-10"
      />

      <View className="items-center px-10">
        <AppText
          variant="serifTitle"
          className="text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {title}
        </AppText>

        {description ? (
          <AppText variant="body" className="mt-1 text-center">
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
