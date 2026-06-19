import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, View } from "react-native";

const SUPPORT_EMAIL = "duobyteapps@gmail.com";

function IconArea() {
  return (
    <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-primary">
      <Ionicons name="headset" size={18} color={Colors.primary} />
    </View>
  );
}

function TextArea() {
  return (
    <View className="flex-1">
      <AppText variant="captionStrong" className="mb-1 text-[10px]">
        Bize Ulaşın
      </AppText>

      <AppText variant="body" className="text-[8px] !leading-[10px]">
        Sorununuz çözülemedi mi? Ekibimiz size yardımcı olmaktan memnuniyet
        duyar.
      </AppText>
    </View>
  );
}

function ButtonArea() {
  const handleSendMail = async () => {
    const subject = encodeURIComponent("Weddion Destek Talebi");
    const body = encodeURIComponent(
      "Merhaba Weddion ekibi,\n\nYaşadığım sorun hakkında destek almak istiyorum.\n\nSorun açıklaması:\n",
    );

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailUrl);

    if (canOpen) {
      await Linking.openURL(mailUrl);
    }
  };

  return (
    <Pressable
      onPress={handleSendMail}
      className="ml-3 flex-row items-center rounded-xl bg-backgroundSoft px-2 py-2"
    >
      <AppText
        variant="captionStrong"
        className="ml-1 font-manropeSemiBold text-[8px]"
      >
        Mesaj Gönder
      </AppText>
    </Pressable>
  );
}

export function SupportContactFooter() {
  return (
    <AppCard className="my-5 !bg-primarySoft">
      <View className="flex-row items-center">
        <IconArea />
        <TextArea />
        <ButtonArea />
      </View>
    </AppCard>
  );
}
