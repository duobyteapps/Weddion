import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

function IconArea() {
  return (
    <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-primary">
      <Ionicons name="information-outline" size={18} color={Colors.primary} />
    </View>
  );
}

function TextArea() {
  return (
    <AppText variant="body" className="flex-1 text-[8px] !leading-[10px]">
      Gizlilik politikamız hakkında detaylı bilgi almak için KVKK Aydınlatma
      Metni’ni inceleyebilirsiniz.
    </AppText>
  );
}

function ButtonArea() {
  return (
    <Pressable
      onPress={() => router.push("/(tabs)/privacy-kvkk")}
      className="ml-3 flex-row items-center rounded-xl bg-backgroundSoft px-2 py-2"
    >
      <AppText
        variant="captionStrong"
        className="font-manropeSemiBold text-[8px]"
      >
        Aydınlatma Metni
      </AppText>

      <Ionicons
        name="arrow-forward"
        size={18}
        color={Colors.primaryDark}
        style={{ marginLeft: 6 }}
      />
    </Pressable>
  );
}

export function PrivacyKvkkFooter() {
  return (
    <AppCard className="!bg-primarySoft my-5">
      <View className="flex-row items-center">
        <IconArea />
        <TextArea />
        <ButtonArea />
      </View>
    </AppCard>
  );
}
