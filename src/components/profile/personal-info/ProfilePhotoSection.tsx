import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import {
  deleteProfileImage,
  pickAndUploadProfileImage,
} from "@/services/profileImageService";
import { updateCurrentUserProfile } from "@/services/profileService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { Ionicons } from "@expo/vector-icons";

type ChangeProfilePhotoParams = {
  avatarUrl: string | null;
  avatarPath: string | null;
};

type Props = {
  avatarUrl: string | null;
  avatarPath: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  onChangeProfilePhoto?: (params: ChangeProfilePhotoParams) => void;
};

export function ProfilePhotoSection({
  avatarUrl,
  avatarPath,
  firstName,
  lastName,
  phone,
  onChangeProfilePhoto,
}: Props) {
  const { showAlert } = useAppAlert();
  const [changingPhoto, setChangingPhoto] = useState(false);

  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : require("@/assets/images/profile/profile.png");

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

  async function handleChangePhoto() {
    let uploadedAvatarPath: string | null = null;

    try {
      setChangingPhoto(true);

      const uploadedImage = await pickAndUploadProfileImage();

      if (!uploadedImage) {
        return;
      }

      uploadedAvatarPath = uploadedImage.avatarPath;

      await updateCurrentUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        avatar_path: uploadedImage.avatarPath,
      });

      onChangeProfilePhoto?.({
        avatarUrl: uploadedImage.avatarUrl,
        avatarPath: uploadedImage.avatarPath,
      });

      if (avatarPath && avatarPath !== uploadedImage.avatarPath) {
        try {
          await deleteProfileImage(avatarPath);
        } catch (deleteError) {
          console.log("Eski profil fotoğrafı silinemedi:", deleteError);
        }
      }

      showAlert({
        title: "Profil Fotoğrafı Güncellendi",
        message: "Profil fotoğrafınız başarıyla değiştirildi.",
        type: "success",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log("Profil fotoğrafı değiştirilemedi:", error);

      if (uploadedAvatarPath) {
        try {
          await deleteProfileImage(uploadedAvatarPath);
        } catch (deleteError) {
          console.log(
            "Yeni yüklenen profil fotoğrafı geri alınamadı:",
            deleteError,
          );
        }
      }

      handleServiceError({
        error,
        fallbackTitle: "Fotoğraf Değiştirilemedi",
        fallbackMessage: "Profil fotoğrafı değiştirilirken bir hata oluştu.",
      });
    } finally {
      setChangingPhoto(false);
    }
  }

  return (
    <View className="mt-6 mb-10">
      <Image
        source={require("@/assets/images/backgrounds/wedding-floral.png")}
        className="absolute -right-1 h-44 w-44 opacity-70"
        resizeMode="contain"
      />

      <View className="flex-row items-center">
        <Pressable disabled={changingPhoto} onPress={handleChangePhoto}>
          <View>
            <Image
              source={avatarSource}
              className="h-20 w-20 rounded-full"
              resizeMode="cover"
            />

            <View className="absolute -bottom-1 -right-1 h-11 w-11 items-center justify-center rounded-full bg-primary">
              <Ionicons name="camera" size={21} color={Colors.white} />
            </View>
          </View>
        </Pressable>

        <View className="ml-5 flex-1">
          <AppText variant="serifSubtitle" numberOfLines={1}>
            Profil Fotoğrafı
          </AppText>

          <AppText variant="caption" numberOfLines={1} className="mt-1 mb-1">
            JPG, PNG veya WEBP. Maksimum 5MB.
          </AppText>

          <AppButton
            title={changingPhoto ? "Hazırlanıyor..." : "Fotoğrafı Değiştir"}
            variant="secondary"
            onPress={handleChangePhoto}
            disabled={changingPhoto}
            loading={changingPhoto}
            className="h-10 w-44 self-start px-3"
            textClassName="text-sm"
          />
        </View>
      </View>
    </View>
  );
}
