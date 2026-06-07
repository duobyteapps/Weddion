import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type Props = {
  avatarUrl: string | null;
};

export function ProfilePhotoSection({ avatarUrl }: Props) {
  return (
    <View className="mt-4 flex-row items-center">
      <View className="relative">
        <Image
          source={
            avatarUrl ? { uri: avatarUrl } : require("@/assets/images/logo.png")
          }
          resizeMode="cover"
          className="h-[108px] w-[108px] rounded-full bg-primarySoft"
        />

        <View className="absolute -bottom-1 -right-1 h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Ionicons name="camera" size={23} color={Colors.white} />
        </View>
      </View>

      <View className="ml-7 flex-1">
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

        <Pressable className="mt-4 h-[48px] flex-row items-center justify-center rounded-2xl border border-primary/50">
          <Ionicons name="camera-outline" size={23} color={Colors.primary} />

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
