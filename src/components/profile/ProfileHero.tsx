import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type ProfileHeroProps = {
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export function ProfileHero({
  fullName,
  email,
  phone,
  avatarUrl,
}: ProfileHeroProps) {
  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : require("@/assets/images/profile/profile.png");

  return (
    <View className="pb-6">
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

          <Pressable className="absolute -bottom-1 -right-1 h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Ionicons name="camera" size={21} color={Colors.white} />
          </Pressable>
        </View>

        <View className="ml-5 flex-1">
          <AppText
            variant="serifTitle"
            className="text-textDark"
            numberOfLines={1}
          >
            {fullName}
          </AppText>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="mail-outline" size={14} color={Colors.textLight} />

            <AppText className="ml-3 flex-1 text-textMuted" numberOfLines={1}>
              {email || "Mail bilgisi yok"}
            </AppText>
          </View>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="call-outline" size={14} color={Colors.textLight} />

            <AppText className="ml-3 flex-1 text-textMuted" numberOfLines={1}>
              {phone || "Telefon bilgisi yok"}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
