import { Image, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function EmptyNotifications() {
  return (
    <AppCard className="mt-6 min-h-[520px] items-center justify-center px-6 py-10">
      <Image
        source={require("@/assets/images/illustration/empty-invitation.png")}
        className="h-[210px] w-[260px]"
        resizeMode="contain"
      />

      <View className="mt-6 items-center">
        <AppText variant="title">Henüz bildiriminiz yok</AppText>

        <AppText
          variant="body"
          className="mt-3 max-w-[300px] text-center !text-[14px] !leading-[23px]"
        >
          Davetlerinize yeni fotoğraf geldiğinde bildirimleriniz burada
          görünecek.
        </AppText>
      </View>
    </AppCard>
  );
}
