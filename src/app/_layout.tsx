import { NotificationBootstrap } from "@/components/notifications/NotificationBootstrap";
import { AppAlertProvider } from "@/components/ui/AppAlert";
import { AuthProvider } from "@/context/AuthContext";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import {
  Tangerine_400Regular,
  Tangerine_700Bold,
} from "@expo-google-fonts/tangerine";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,

    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,

    Tangerine_400Regular,
    Tangerine_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppAlertProvider>
          <NotificationBootstrap />
          <Stack screenOptions={{ headerShown: false }} />
        </AppAlertProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
