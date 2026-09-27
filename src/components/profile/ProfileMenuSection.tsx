import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Linking, Platform, Pressable, View } from "react-native";

import { AppCard } from "../ui/AppCard";
import { AppDivider } from "../ui/AppDivider";
import { AppIconBox } from "../ui/AppIconBox";

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

const ANDROID_PACKAGE_NAME = "com.duobyteapps.weddion";

const PLAY_STORE_APP_URL = `market://details?id=${ANDROID_PACKAGE_NAME}`;

const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

/*
 * Buraya App Store Connect'teki
 * Weddion Apple App ID'sini yazacağız.
 *
 * Örnek:
 * 1234567890
 */
const APP_STORE_APP_ID = "6782302375";

const APP_STORE_APP_URL = `itms-apps://itunes.apple.com/app/id${APP_STORE_APP_ID}?action=write-review`;

const APP_STORE_WEB_URL = `https://apps.apple.com/app/id${APP_STORE_APP_ID}?action=write-review`;

export function ProfileMenuSection({ title, items }: Props) {
  async function openRateApp() {
    try {
      if (Platform.OS === "ios") {
        const canOpenAppStore = await Linking.canOpenURL(APP_STORE_APP_URL);

        if (canOpenAppStore) {
          await Linking.openURL(APP_STORE_APP_URL);

          return;
        }

        await Linking.openURL(APP_STORE_WEB_URL);

        return;
      }

      if (Platform.OS === "android") {
        const canOpenPlayStore = await Linking.canOpenURL(PLAY_STORE_APP_URL);

        if (canOpenPlayStore) {
          await Linking.openURL(PLAY_STORE_APP_URL);

          return;
        }

        await Linking.openURL(PLAY_STORE_WEB_URL);
      }
    } catch (error) {
      console.log("Mağaza açılamadı:", error);

      if (Platform.OS === "ios") {
        await Linking.openURL(APP_STORE_WEB_URL);

        return;
      }

      await Linking.openURL(PLAY_STORE_WEB_URL);
    }
  }

  async function openExternalUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Bağlantı açılamadı:", error);
    }
  }

  function handlePress(item: MenuItem) {
    if (item.onPress) {
      item.onPress();
      return;
    }

    /*
     * Uygulamayı değerlendir için
     * platforma özel mağazayı aç.
     */
    if (item.label === "Uygulamayı Değerlendir") {
      openRateApp();
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
    <View>
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
                <AppIconBox
                  icon={item.icon}
                  color={color}
                  className="mr-4 rounded-xl bg-primarySoft"
                />

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
