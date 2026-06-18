import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import {
  getUnreadNotificationCount,
  subscribeCurrentUserNotifications,
} from "@/services/notificationService";
import { getAuthenticatedUser } from "@/services/sessionService";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function AppHeader() {
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnreadCount() {
    try {
      const user = await getAuthenticatedUser();

      setUserId(user.id);

      const count = await getUnreadNotificationCount();

      setUnreadCount(count);
    } catch {
      setUserId(null);
      setUnreadCount(0);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, []),
  );

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    if (!userId) {
      return;
    }

    channel = subscribeCurrentUserNotifications({
      userId,
      channelKey: "header",
      onInsert: () => {
        setUnreadCount((currentCount) => currentCount + 1);
      },
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [userId]);

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
