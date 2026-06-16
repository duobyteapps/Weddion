import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, View } from "react-native";

import { Colors } from "@/constants/Colors";
import {
  lavenderBranchLeft,
  lavenderBranchRight,
} from "@/constants/dowryImages";

export function DowryAddProductHeader() {
  return (
    <View className="mb-6 items-center">
      <View className="w-full flex-row items-center justify-center">
        <Image
          source={lavenderBranchLeft}
          className="mr-3 h-24 w-24"
          resizeMode="contain"
        />

        <View className="h-20 w-20 items-center justify-center rounded-full bg-primarySoft">
          <MaterialCommunityIcons
            name="plus"
            size={42}
            color={Colors.primaryDark}
          />
        </View>

        <Image
          source={lavenderBranchRight}
          className="ml-3 h-24 w-24"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
