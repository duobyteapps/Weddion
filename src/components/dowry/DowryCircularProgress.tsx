import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

type DowryCircularProgressProps = {
  value: number;
};

export function DowryCircularProgress({ value }: DowryCircularProgressProps) {
  const size = 135;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(Math.max(value, 0), 100);
  const progressOffset = circumference - (safeValue / 100) * circumference;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.primarySoft}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View className="absolute items-center">
        <AppText variant="serifTitle" className="text-textDark">
          %{safeValue}
        </AppText>

        <AppText variant="serifSubtitle" className="text-textDark">
          Tamamlandı
        </AppText>
      </View>
    </View>
  );
}
