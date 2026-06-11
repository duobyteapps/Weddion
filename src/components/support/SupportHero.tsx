import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Image, View } from "react-native";

export function SupportHero() {
  return (
    <AppCard className="relative overflow-hidden">
      <View className="z-10 w-[56%]">
        <AppText variant="serifTitle" className="!text-[20px] !leading-[23px]">
          Yardıma ihtiyacınız{"\n"}olduğunda buradayız
        </AppText>

        <AppText variant="caption" className="mt-2">
          Ekiplerimiz en kısa sürede size yardımcı olacaktır.
        </AppText>
      </View>

      <Image
        source={require("@/assets/images/illustration/support-hero.png")}
        className="absolute right-[8px] top-[18px] h-[105px] w-[140px]"
        resizeMode="contain"
      />
    </AppCard>
  );
}
