import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";

type Props = {
  avatarUrl: string | null;
};

export function ProfilePhotoSection({ avatarUrl }: Props) {
  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : require("@/assets/images/profile/profile.png");

  return (
    <View className="mt-6">
      <Image
        source={require("@/assets/images/backgrounds/wedding-floral.png")}
        className="absolute -right-1 h-44 w-44 opacity-70"
        resizeMode="contain"
      />

      <View className="flex-row items-center">
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

        <View className="ml-5 flex-1">
          <AppText variant="serifSubtitle" numberOfLines={1} className="mb-1">
            Profil Fotoğrafı
          </AppText>

          <AppText variant="caption" numberOfLines={1}>
            JPG, PNG veya WEBP. Maksimum 5MB.
          </AppText>

          <AppButton
            title="Fotoğrafı Değiştir"
            variant="ghost"
            className="mt-1 border-primary/50 font-manropeSemiBold text-[13px]"
            onPress={() => {}}
          />
        </View>
      </View>
    </View>
  );
}
