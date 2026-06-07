import { AccountPreferencesCard } from "@/components/profile/personal-info/AccountPreferencesCard";
import { PersonalInfoCard } from "@/components/profile/personal-info/PersonalInfoCard";
import { PersonalInfoHeader } from "@/components/profile/personal-info/PersonalInfoHeader";
import { ProfilePhotoSection } from "@/components/profile/personal-info/ProfilePhotoSection";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/services/profileService";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

export default function PersonalInfoScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

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
      setEmailNotifications(profile.email_notifications ?? true);
      setSmsNotifications(profile.sms_notifications ?? true);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Hata",
        error instanceof Error ? error.message : "Profil bilgileri alınamadı.",
      );
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
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
      });

      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
    } catch (error) {
      console.log(error);
      Alert.alert("Hata", "Profil bilgileriniz güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-28"
      >
        <PersonalInfoHeader />

        <ProfilePhotoSection avatarUrl={avatarUrl} />

        <View className="mt-8">
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
        </View>

        <View className="mt-6">
          <AccountPreferencesCard
            emailNotifications={emailNotifications}
            smsNotifications={smsNotifications}
            onChangeEmailNotifications={setEmailNotifications}
            onChangeSmsNotifications={setSmsNotifications}
          />
        </View>

        <AppButton
          title={saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          onPress={handleSave}
          disabled={saving}
          className="mt-7 h-[56px] rounded-2xl"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
