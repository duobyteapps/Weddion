// src/app/(tabs)/profile.tsx
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function ProfileScreen() {
  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 items-center justify-center px-5">
        <AppText variant="title" className="text-text">
          Profil
        </AppText>
      </View>
    </ScreenContainer>
  );
}
