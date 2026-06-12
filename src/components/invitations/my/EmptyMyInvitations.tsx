import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Image, View } from "react-native";

type EmptyMyInvitations = {
  onCreatePress: () => void;
};

export function EmptyMyInvitations({ onCreatePress }: EmptyMyInvitations) {
  return (
    <AppCard className="mt-6 min-h-[520px] items-center justify-center px-6 py-10">
      <Image
        source={require("@/assets/images/illustration/empty-invitation.png")}
        className="h-[210px] w-[260px]"
        resizeMode="contain"
      />

      <View className="mt-6 items-center">
        <AppText variant="title">Henüz davetiyeniz yok</AppText>

        <AppText
          variant="body"
          className="mt-3 max-w-[300px] text-center !text-[14px] !leading-[23px]"
        >
          İlk davetiyenizi oluşturarak sevdiklerinizi özel gününüze davet etmeye
          başlayın.
        </AppText>
      </View>

      <AppButton
        title="Yeni Davetiye Oluştur"
        className="mt-8 w-full max-w-[300px]"
        onPress={onCreatePress}
      />
    </AppCard>
  );
}
