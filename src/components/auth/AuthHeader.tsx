import { Image, View } from "react-native";

import { AppLogo } from "@/components/ui/AppLogo";
import { AppText } from "@/components/ui/AppText";

type Props = {
  description?: string;
  descriptionClassName?: string;
  className?: string;
};

export function AuthHeader({
  description = "Özel anlar, unutulmaz davetiyeler",
  descriptionClassName = "mt-1 text-center text-textMuted",
  className = "",
}: Props) {
  return (
    <View className={`relative items-center ${className}`}>
      <Image
        source={require("@/assets/images/backgrounds/lavender-bloom.png")}
        className="absolute -left-28 -top-1 h-60 w-60 opacity-85"
        resizeMode="contain"
      />

      <Image
        source={require("@/assets/images/backgrounds/floral-corner.png")}
        className="absolute -right-28 -top-1 h-60 w-60 opacity-85"
        resizeMode="contain"
      />

      <AppLogo size="lg" />

      <AppText variant="body" className={descriptionClassName}>
        {description}
      </AppText>
    </View>
  );
}
