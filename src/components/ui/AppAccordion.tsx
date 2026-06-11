import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Pressable, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { AppDivider } from "./AppDivider";
import { AppText } from "./AppText";

type AppAccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  showDivider?: boolean;
};

export function AppAccordion({
  title,
  children,
  defaultOpen = false,
  showDivider = true,
}: AppAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        className="flex-row items-center justify-between gap-4 py-5"
      >
        <AppText variant="captionStrong" className="flex-1 text-text">
          {title}
        </AppText>

        <Ionicons
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          size={18}
          color={Colors.primary}
        />
      </Pressable>

      {isOpen && <View className="pb-4 pr-8">{children}</View>}

      {showDivider && <AppDivider />}
    </View>
  );
}
