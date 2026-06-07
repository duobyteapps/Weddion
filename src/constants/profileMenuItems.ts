// src/constants/profileMenuItems.ts
import { Ionicons } from "@expo/vector-icons";

export type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
};

export const accountMenuItems: ProfileMenuItem[] = [
  { label: "Kişisel Bilgiler", icon: "person-outline" },
  { label: "Şifre ve Güvenlik", icon: "lock-closed-outline" },
  { label: "Bildirim Ayarları", icon: "notifications-outline" },
  { label: "Gizlilik ve KVKK", icon: "shield-checkmark-outline" },
];

export const otherMenuItems: ProfileMenuItem[] = [
  { label: "Yardım ve Destek", icon: "help-circle-outline" },
  { label: "Bize Ulaşın", icon: "chatbox-ellipses-outline" },
  { label: "Uygulamayı Değerlendir", icon: "star-outline" },
  {
    label: "Profilimi ve Bilgilerimi Sil",
    icon: "trash-outline",
    danger: true,
  },
  { label: "Çıkış Yap", icon: "log-out-outline", danger: true },
];
