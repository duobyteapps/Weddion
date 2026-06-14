import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";

type Props = {
  title?: string;
  date?: string;
};

export function GuestPhotoEventHeader({
  title = "Sevda & Emre",
  date = "24 Mayıs 2025",
}: Props) {
  return (
    <View className="relative mb-10 mt-7 items-center justify-center">
      <Image
        source={require("@/assets/images/illustration/lavender-floral-arch-frame.png")}
        className="absolute h-[190px] w-full"
        resizeMode="contain"
      />

      <View className="z-10 items-center">
        <Ionicons name="heart" size={16} color="#B88BE6" className="mb-2" />

        <AppText variant="serifSubtitle">{title}</AppText>

        <AppText variant="caption" className="mt-1 text-primary">
          {date}
        </AppText>

        <Image
          source={require("@/assets/images/wedding-divider.png")}
          className="mt-3 h-4 w-40 opacity-70"
          resizeMode="contain"
          style={{ tintColor: "#8F5DB9" }}
        />
      </View>
    </View>
  );
}
