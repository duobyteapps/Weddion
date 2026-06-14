import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { SelectedPhoto } from "./types";

type Props = {
  photo: SelectedPhoto;
  onRemove: (photoId: string) => void;
};

export function GuestPhotoSelectedCard({ photo, onRemove }: Props) {
  return (
    <View className="relative flex-1">
      <View className="aspect-square overflow-hidden rounded-[18px] bg-primarySoft">
        <Image
          source={{ uri: photo.uri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <Pressable
        onPress={() => onRemove(photo.id)}
        className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
      >
        <Ionicons name="close" size={16} color="#4D3D61" />
      </Pressable>
    </View>
  );
}
