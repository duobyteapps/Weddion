import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";
import { Pressable, View } from "react-native";

import { AppCard } from "../ui/AppCard";
import { AppDivider } from "../ui/AppDivider";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: Href;
  danger?: boolean;
  onPress?: () => void;
};

type Props = {
  title: string;
  items: MenuItem[];
};

export function ProfileMenuSection({ title, items }: Props) {
  const appRouter = useAppNavigation();

  function handlePress(item: MenuItem) {
    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.route) {
      appRouter.push({
        pathname: item.route,
      });
    }
  }

  return (
    <AppCard>
      <AppText variant="subtitle" className="mb-2 text-textDark">
        {title}
      </AppText>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = item.danger ? "#D24B5B" : Colors.primary;

        return (
          <View key={item.label}>
            <Pressable
              onPress={() => handlePress(item)}
              className={`flex-row items-center ${
                isLast ? "pt-3 pb-0" : "py-3"
              }`}
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Ionicons name={item.icon} size={20} color={color} />
              </View>

              <AppText
                variant="body"
                className={`flex-1 ${
                  item.danger ? "text-danger" : "text-textDark"
                }`}
              >
                {item.label}
              </AppText>

              {!item.danger && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              )}
            </Pressable>

            {!isLast && <AppDivider />}
          </View>
        );
      })}
    </AppCard>
  );
}
