import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Linking, Platform, Pressable, View } from "react-native";

import { AppCard } from "../ui/AppCard";
import { AppDivider } from "../ui/AppDivider";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  route?: Href;
  url?: string;
  onPress?: () => void;
};

type Props = {
  title: string;
  items: MenuItem[];
};

const PLAY_STORE_PACKAGE_NAME = "com.duobyteapps.weddion";

const PLAY_STORE_APP_URL = `market://details?id=${PLAY_STORE_PACKAGE_NAME}`;

const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE_NAME}`;

export function ProfileMenuSection({ title, items }: Props) {
  async function openExternalUrl(url: string) {
    try {
      if (url.startsWith("market://")) {
        if (Platform.OS === "android") {
          const canOpenMarket = await Linking.canOpenURL(url);

          if (canOpenMarket) {
            await Linking.openURL(url);
            return;
          }
        }

        await Linking.openURL(PLAY_STORE_WEB_URL);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log("Bağlantı açılamadı:", error);

      await Linking.openURL(PLAY_STORE_WEB_URL);
    }
  }

  function handlePress(item: MenuItem) {
    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.url) {
      openExternalUrl(item.url);
      return;
    }

    if (item.route) {
      router.push(item.route);
    }
  }

  return (
    <View className="mx-6 mb-6">
      <AppText variant="subtitle" className="mb-3 text-text">
        {title}
      </AppText>

      <AppCard>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const color = item.danger ? "#D24B5B" : Colors.primary;

          return (
            <View key={item.label}>
              <Pressable
                onPress={() => handlePress(item)}
                className={`flex-row items-center ${
                  isLast ? "pt-3 pb-0" : "py-3"
                }`}
              >
                <View className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Ionicons name={item.icon} size={21} color={color} />
                </View>

                <AppText
                  variant="body"
                  className={`flex-1 ${
                    item.danger ? "text-[#D24B5B]" : "text-text"
                  }`}
                >
                  {item.label}
                </AppText>

                {!item.danger && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textMuted}
                  />
                )}
              </Pressable>

              {!isLast && <AppDivider />}
            </View>
          );
        })}
      </AppCard>
    </View>
  );
}
