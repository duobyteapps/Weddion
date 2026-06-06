import { Image, Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function PromoCard() {
  return (
    <AppCard className="mb-24 mt-5 flex-row items-center overflow-hidden border-0 !bg-primarySoft px-5 py-5">
      <View className="z-10 flex-1 pr-2">
        <AppText variant="subtitle" className="text-[18px] leading-7 text-text">
          Premium davetiyelerle fark yaratın ✨
        </AppText>

        <AppText
          variant="caption"
          className="mt-3 text-[13px] leading-5 text-textMuted"
        >
          Özel tasarımlarımızı keşfedin.
        </AppText>

        <Pressable className="mt-5 h-11 w-40 items-center justify-center rounded-xl bg-surface">
          <AppText
            variant="captionStrong"
            className="font-manropeSemiBold text-[13px] text-primaryDark"
          >
            Tasarım Keşfet
          </AppText>
        </Pressable>
      </View>

      <Image
        source={require("../../../assets/images/lavender-wedding-invitation.png")}
        className="-mr-4 h-44 w-44"
        resizeMode="contain"
      />
    </AppCard>
  );
}
