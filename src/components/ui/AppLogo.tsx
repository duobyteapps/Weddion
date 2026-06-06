import { Image, ImageStyle, View } from "react-native";

type AppLogoProps = {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
};

const logoSize = {
  sm: {
    wrapper: "h-14 w-14 rounded-2xl",
    image: {
      width: 42,
      height: 42,
    },
    name: {
      width: 120,
      height: 34,
    },
  },
  md: {
    wrapper: "h-20 w-20 rounded-[24px]",
    image: {
      width: 58,
      height: 58,
    },
    name: {
      width: 150,
      height: 42,
    },
  },
  lg: {
    wrapper: "h-24 w-24 rounded-[28px]",
    image: {
      width: 70,
      height: 70,
    },
    name: {
      width: 180,
      height: 50,
    },
  },
};

export function AppLogo({
  size = "md",
  showName = true,
  className = "",
}: AppLogoProps) {
  const currentSize = logoSize[size];

  return (
    <View className={`items-center ${className}`}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={currentSize.image as ImageStyle}
        resizeMode="contain"
      />

      {showName ? (
        <Image
          source={require("@/assets/images/logo-name.png")}
          style={[
            currentSize.name as ImageStyle,
            {
              marginTop: 5,
            },
          ]}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}
