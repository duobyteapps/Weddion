import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

export function DashboardHeader() {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="h-10 w-10 items-center justify-center">
        <Image
          source={require("../../../assets/images/logo.png")}
          className="h-8 w-8"
          resizeMode="contain"
        />
      </View>

      <Image
        source={require("../../../assets/images/logo-name.png")}
        className="h-8 w-28"
        resizeMode="contain"
      />

      <Pressable className="h-10 w-10 items-center justify-center rounded-full">
        <Ionicons name="notifications-outline" size={22} color="#3D3046" />
      </Pressable>
    </View>
  );
}
