import { GuestPhotoEventHeader } from "@/components/guest-photo/guest-photo-upload/GuestPhotoEventHeader";
import { GuestPhotoPrivacyNotice } from "@/components/guest-photo/guest-photo-upload/GuestPhotoPrivacyNotice";
import { GuestPhotoSelectedSection } from "@/components/guest-photo/guest-photo-upload/GuestPhotoSelectedSection";
import { GuestPhotoSourceActions } from "@/components/guest-photo/guest-photo-upload/GuestPhotoSourceActions";
import { GuestPhotoUploadIntro } from "@/components/guest-photo/guest-photo-upload/GuestPhotoUploadIntro";
import { SelectedPhoto } from "@/components/guest-photo/guest-photo-upload/types";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

const SAMPLE_PHOTOS: SelectedPhoto[] = [
  {
    id: "1",
    uri: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "2",
    uri: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "3",
    uri: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=500&auto=format&fit=crop",
  },
];

export default function GuestPhotoUploadScreen() {
  const router = useRouter();

  const selectedPhotos = SAMPLE_PHOTOS;

  function handleRemovePhoto(photoId: string) {
    console.log("Fotoğraf kaldır:", photoId);
  }

  function handleRemoveAllPhotos() {
    console.log("Tüm fotoğrafları kaldır");
  }

  function handleCameraPress() {
    console.log("Kamera açılacak");
  }

  function handleGalleryPress() {
    console.log("Galeri açılacak");
  }

  function handleUploadPhotos() {
    console.log("Fotoğraflar yüklenecek");
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <AppBackButton onPress={handleBack} />

        <GuestPhotoEventHeader />

        <GuestPhotoPrivacyNotice />

        <AppCard>
          <GuestPhotoUploadIntro />

          <GuestPhotoSourceActions
            onCameraPress={handleCameraPress}
            onGalleryPress={handleGalleryPress}
          />

          <GuestPhotoSelectedSection
            selectedPhotos={selectedPhotos}
            onRemovePhoto={handleRemovePhoto}
            onRemoveAllPhotos={handleRemoveAllPhotos}
          />
        </AppCard>

        <AppButton
          title="Fotoğrafları Yükle"
          disabled={selectedPhotos.length === 0}
          onPress={handleUploadPhotos}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
