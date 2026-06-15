import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { PersonalInfoCard } from "@/components/profile/personal-info/PersonalInfoCard";
import { PersonalInfoHeader } from "@/components/profile/personal-info/PersonalInfoHeader";
import { ProfilePhotoSection } from "@/components/profile/personal-info/ProfilePhotoSection";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/services/profileService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";

export default function PersonalInfoScreen() {
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  function handleServiceError(params: {
    error: unknown;
    fallbackTitle: string;
    fallbackMessage: string;
  }) {
    const message =
      params.error instanceof Error
        ? params.error.message
        : params.fallbackMessage;

    const isSessionExpired = message === SESSION_EXPIRED_MESSAGE;

    showAlert({
      title: isSessionExpired ? "Oturum Süresi Doldu" : params.fallbackTitle,
      message,
      type: isSessionExpired ? "warning" : "error",
      confirmText: isSessionExpired ? "Giriş Yap" : "Tamam",
      onConfirm: () => {
        if (isSessionExpired) {
          router.replace("/auth/login");
        }
      },
    });
  }

  async function loadProfile() {
    try {
      setLoading(true);

      const { user, profile } = await getCurrentUserProfile();

      setEmail(user.email ?? "");
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setBirthDate(profile.birth_date ?? "");

      setAvatarUrl(profile.avatar_url);
      setAvatarPath(profile.avatar_path);
    } catch (error) {
      console.log("Profil alınamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Profil Alınamadı",
        fallbackMessage: "Profil bilgileri alınamadı.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      await updateCurrentUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        birth_date: birthDate,
        avatar_path: avatarPath,
      });

      showAlert({
        title: "Profil Güncellendi",
        message: "Profil bilgileriniz başarıyla güncellendi.",
        type: "success",
      });
    } catch (error) {
      console.log("Profil güncellenemedi:", error);

      handleServiceError({
        error,
        fallbackTitle: "Profil Güncellenemedi",
        fallbackMessage: "Profil bilgileriniz güncellenemedi.",
      });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
      >
        <PersonalInfoHeader />

        <ProfilePhotoSection
          avatarUrl={avatarUrl}
          avatarPath={avatarPath}
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          birthDate={birthDate}
          onChangeProfilePhoto={(photo) => {
            setAvatarUrl(photo.avatarUrl);
            setAvatarPath(photo.avatarPath);
          }}
        />

        <PersonalInfoCard
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          birthDate={birthDate}
          onChangeFirstName={setFirstName}
          onChangeLastName={setLastName}
          onChangePhone={setPhone}
          onChangeBirthDate={setBirthDate}
        />

        <View className="mt-6">
          <AppButton
            title={saving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
