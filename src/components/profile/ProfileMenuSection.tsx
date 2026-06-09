import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
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
  function handlePress(item: MenuItem) {
    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.route) {
      router.push(item.route);
    }
  }

  return (
    <AppCard>
      <AppText variant="serifTitle" className="mb-3 text-textDark">
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
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-primarySoft">
                <Ionicons name={item.icon} size={14} color={color} />
              </View>

              <AppText
                variant="body"
                className={`ml-4 flex-1 font-manropeSemiBold ${
                  item.danger ? "text-[#D24B5B]" : "text-textDark"
                }`}
              >
                {item.label}
              </AppText>

              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.textLight}
              />
            </Pressable>

            {!isLast && <AppDivider className="ml-12" />}
          </View>
        );
      })}
    </AppCard>
  );
}
