// src/components/profile/personal-info/ProfilePhotoSection.tsx
import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

export function ProfilePhotoSection() {
  return (
    <View className="relative mt-4 min-h-[170px] flex-row items-center">
      <Image
        source={require("@/assets/images/wedding-floral.png")}
        resizeMode="contain"
        className="absolute -right-12 -top-10 h-[210px] w-[210px] opacity-80"
      />

      <View className="relative z-10">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400",
          }}
          className="h-[108px] w-[108px] rounded-full"
        />

        <View className="absolute -bottom-1 -right-1 h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Ionicons name="camera" size={23} color="#FFFFFF" />
        </View>
      </View>

      <View className="z-10 ml-7 flex-1">
        <AppText
          variant="serifSubtitle"
          className="text-[24px] leading-[30px] text-textDark"
        >
          Profil Fotoğrafı
        </AppText>

        <AppText
          variant="caption"
          className="mt-1 text-[13px] font-manropeSemiBold text-textMuted"
        >
          JPG, PNG veya WEBP. Maksimum 5MB.
        </AppText>

        <Pressable className="mt-4 h-[48px] flex-row items-center justify-center rounded-2xl border border-primary/50 bg-transparent">
          <Ionicons name="camera-outline" size={23} color="#A875D1" />

          <AppText
            variant="body"
            className="ml-3 text-[14px] font-manropeBold text-primary"
          >
            Fotoğrafı Değiştir
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
