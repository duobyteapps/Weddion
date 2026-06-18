import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { getUnreadNotificationCount } from "@/services/notificationService";

export function AppHeader() {
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationCount();

      setUnreadCount(count);
    } catch (error) {
      console.log("Okunmamış bildirim sayısı alınamadı:", error);
      setUnreadCount(0);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, []),
  );

  function handlePressNotifications() {
    router.push("/(tabs)/notifications");
  }

  return (
    <View className="mb-6 flex-row items-center justify-between pt-3">
      <View className="h-9 w-9 items-center justify-center">
        <Image
          source={require("../../../assets/images/logo.png")}
          className="h-8 w-8"
          resizeMode="contain"
        />
      </View>

      <Image
        source={require("../../../assets/images/logo-name.png")}
        className="h-8 w-32"
        resizeMode="contain"
      />

      <Pressable
        onPress={handlePressNotifications}
        className="h-9 w-9 items-center justify-center rounded-full"
      >
        <Ionicons name="notifications-outline" size={22} color="#3D3046" />

        {unreadCount > 0 && (
          <View className="absolute right-1 top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1">
            <AppText className="text-[10px] leading-3 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}
