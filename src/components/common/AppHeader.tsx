import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

export function AppHeader() {
  return (
    <View className="mb-6 pt-3 flex-row items-center justify-between">
      <View className="h-9 w-9 items-center justify-center">
        <Image
          source={require("../../../assets/images/logo.png")}
          className="h-8 w-8"
          resizeMode="contain"
        />
      </View>

      <Image
        source={require("../../../assets/images/logo-name.png")}
        className="h-8 w-32"
        resizeMode="contain"
      />

      <Pressable className="h-9 w-9 items-center justify-center rounded-full">
        <Ionicons name="notifications-outline" size={22} color="#3D3046" />
      </Pressable>
    </View>
  );
}
