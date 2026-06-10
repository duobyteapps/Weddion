import { router, type Href } from "expo-router";
import { View } from "react-native";

import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppText } from "@/components/ui/AppText";

type ScreenHeaderProps = {
  title: string;
  description?: string;
  backTo?: Href;
};

export function ScreenHeader({
  title,
  description,
  backTo = "/(tabs)/profile",
}: ScreenHeaderProps) {
  return (
    <View className="relative justify-center mb-8">
      <AppBackButton
        onPress={() => router.replace(backTo)}
        className="absolute left-0 z-10"
      />

      <View className="items-center px-10">
        <AppText variant="serifTitle">{title}</AppText>

        {description ? (
          <AppText variant="body" className="mt-1 text-center">
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
