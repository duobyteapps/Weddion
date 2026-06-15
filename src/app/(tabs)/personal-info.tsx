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
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

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
    } catch (error) {
      console.log(error);

      showAlert({
        title: "Profil Alınamadı",
        message:
          error instanceof Error
            ? error.message
            : "Profil bilgileri alınamadı.",
        type: "error",
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
        avatar_url: avatarUrl,
      });

      showAlert({
        title: "Profil Güncellendi",
        message: "Profil bilgileriniz başarıyla güncellendi.",
        type: "success",
      });
    } catch (error) {
      console.log(error);

      showAlert({
        title: "Profil Güncellenemedi",
        message:
          error instanceof Error
            ? error.message
            : "Profil bilgileriniz güncellenemedi.",
        type: "error",
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
          onChangeAvatarUrl={setAvatarUrl}
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
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
