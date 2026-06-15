import { AppHeader } from "@/components/common/AppHeader";
import { PremiumCard } from "@/components/profile/PremiumCard";
import { ProfileEventCard } from "@/components/profile/ProfileEventCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileMenuSection } from "@/components/profile/ProfileMenuSection";
import { useAppAlert } from "@/components/ui/AppAlert";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { accountMenuItems, otherMenuItems } from "@/constants/profileMenuItems";
import { logoutUser } from "@/services/authService";
import {
  deleteCurrentUserAccount,
  getCurrentUserProfile,
  Profile,
  SESSION_EXPIRED_MESSAGE,
} from "@/services/profileService";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

export default function ProfileScreen() {
  const { showAlert } = useAppAlert();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "Kullanıcı";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchProfile() {
        try {
          setLoading(true);

          const { user, profile } = await getCurrentUserProfile();

          if (!isActive) return;

          setProfile(profile);
          setEmail(user.email ?? "");
        } catch (error) {
          if (!isActive) return;

          const message =
            error instanceof Error
              ? error.message
              : "Profil bilgileri alınırken bir hata oluştu.";

          const isSessionExpired = message === SESSION_EXPIRED_MESSAGE;

          setProfile(null);
          setEmail("");

          showAlert({
            title: isSessionExpired ? "Oturum Süresi Doldu" : "Profil Hatası",
            message,
            type: isSessionExpired ? "warning" : "error",
            confirmText: isSessionExpired ? "Giriş Yap" : "Tamam",
            onConfirm: () => {
              if (isSessionExpired) {
                router.replace("/auth/login");
              }
            },
          });
        } finally {
          if (isActive) setLoading(false);
        }
      }

      fetchProfile();

      return () => {
        isActive = false;
      };
    }, [showAlert]),
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/auth/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Çıkış yapılırken bir hata oluştu.";

      showAlert({
        title: "Çıkış Hatası",
        message,
        type: "error",
      });
    }
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: "Profil Silinsin mi?",
      message:
        "Profiliniz ve size ait tüm bilgiler kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      type: "warning",
      confirmText: "Evet, Sil",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          await deleteCurrentUserAccount();
          router.replace("/auth/login");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Hesap silinirken bir hata oluştu.";

          showAlert({
            title: "Silme Hatası",
            message,
            type: "error",
          });
        }
      },
    });
  };

  const menuItems = otherMenuItems.map((item) => {
    if (item.label === "Çıkış Yap") {
      return {
        ...item,
        onPress: handleLogout,
      };
    }

    if (item.label === "Profilimi ve Bilgilerimi Sil") {
      return {
        ...item,
        onPress: handleDeleteAccount,
      };
    }

    return item;
  });

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <AppHeader />

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
          </View>
        ) : (
          <ProfileHero
            fullName={fullName}
            email={email}
            phone={profile?.phone}
            avatarUrl={profile?.avatar_url}
          />
        )}

        <ProfileMenuSection title="Hesabım" items={accountMenuItems} />
        <ProfileEventCard />
        <ProfileMenuSection title="Diğer" items={menuItems} />
        <PremiumCard />
      </ScrollView>
    </ScreenContainer>
  );
}
