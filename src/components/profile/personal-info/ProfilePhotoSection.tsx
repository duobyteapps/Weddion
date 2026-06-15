import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type Props = {
  avatarUrl: string | null;
  onChangeAvatarUrl: (avatarUrl: string | null) => void;
};

export function ProfilePhotoSection({ avatarUrl, onChangeAvatarUrl }: Props) {
  return (
    <View className="mt-8 items-center">
      <View className="relative">
        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primarySoft">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-outline" size={42} color="#A56AD6" />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeAvatarUrl(avatarUrl)}
          className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary"
        >
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AppText className="mt-3 text-center text-sm text-textSoft">
        Profil fotoğrafınızı düzenleyin
      </AppText>
    </View>
  );
}
