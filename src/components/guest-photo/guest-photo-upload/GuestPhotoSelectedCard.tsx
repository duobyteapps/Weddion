import { Feather } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

import { SelectedPhoto } from "./types";

type Props = {
  photo: SelectedPhoto;
  onRemove: (photoId: string) => void;
};

export function GuestPhotoSelectedCard({ photo, onRemove }: Props) {
  return (
    <View className="relative w-[31.5%]">
      <View className="aspect-square overflow-hidden rounded-[18px] bg-primarySoft">
        <Image
          source={{ uri: photo.uri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <Pressable
        onPress={() => onRemove(photo.id)}
        hitSlop={8}
        className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-red-50 shadow-sm"
      >
        <Feather name="trash-2" size={14} color="#D85C5C" />
      </Pressable>
    </View>
  );
}
