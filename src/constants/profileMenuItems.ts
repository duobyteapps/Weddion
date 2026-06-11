import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";

export type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: Href;
  url?: string;
  danger?: boolean;
};

export const accountMenuItems: ProfileMenuItem[] = [
  {
    label: "Kişisel Bilgiler",
    icon: "person-outline",
    route: "/(tabs)/personal-info",
  },
  {
    label: "Şifre ve Güvenlik",
    icon: "lock-closed-outline",
    route: "/(tabs)/change-password",
  },
  {
    label: "Bildirim Ayarları",
    icon: "notifications-outline",
    route: "/(tabs)/notification-settings",
  },
  {
    label: "Gizlilik ve KVKK",
    icon: "shield-checkmark-outline",
    route: "/(tabs)/privacy-kvkk",
  },
];

export const otherMenuItems: ProfileMenuItem[] = [
  {
    label: "Yardım ve Destek",
    icon: "help-circle-outline",
    route: "/(tabs)/support",
  },
  {
    label: "Uygulamayı Değerlendir",
    icon: "star-outline",
    url: "market://details?id=com.duobyteapps.weddion",
  },
  {
    label: "Profilimi ve Bilgilerimi Sil",
    icon: "trash-outline",
    danger: true,
  },
  {
    label: "Çıkış Yap",
    icon: "log-out-outline",
    danger: true,
  },
];
