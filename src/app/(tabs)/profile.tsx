import { AppHeader } from "@/components/common/AppHeader";
import { PremiumCard } from "@/components/profile/PremiumCard";
import { ProfileEventCard } from "@/components/profile/ProfileEventCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileMenuSection } from "@/components/profile/ProfileMenuSection";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { accountMenuItems, otherMenuItems } from "@/constants/profileMenuItems";
import { logoutUser } from "@/services/authService";
import { getCurrentUserProfile, Profile } from "@/services/profileService";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

export default function ProfileScreen() {
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
        } finally {
          if (isActive) setLoading(false);
        }
      }

      fetchProfile();

      return () => {
        isActive = false;
      };
    }, []),
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

      Alert.alert("Çıkış Hatası", message);
    }
  };

  const menuItemsWithLogout = otherMenuItems.map((item) =>
    item.label === "Çıkış Yap"
      ? {
          ...item,
          onPress: handleLogout,
        }
      : item,
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <AppHeader />

        {loading ? (
          <View className="py-10 items-center justify-center">
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
        <ProfileMenuSection title="Diğer" items={menuItemsWithLogout} />
        <PremiumCard />
      </ScrollView>
    </ScreenContainer>
  );
}
