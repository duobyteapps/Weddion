import { Feather, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type IconSet = "ionicons" | "feather";

type Props = {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
  iconSet?: IconSet;
  color?: string;
  size?: number;
  className?: string;
};

export function AppIconBox({
  icon,
  iconSet = "ionicons",
  color = "#A875D1",
  size = 18,
  className = "",
}: Props) {
  return (
    <View
      className={[
        "h-11 w-11 items-center justify-center rounded-2xl bg-primary/10",
        className,
      ].join(" ")}
    >
      {iconSet === "feather" ? (
        <Feather
          name={icon as keyof typeof Feather.glyphMap}
          size={size}
          color={color}
        />
      ) : (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={size}
          color={color}
        />
      )}
    </View>
  );
}
