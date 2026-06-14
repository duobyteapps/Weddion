import { AppText } from "@/components/ui/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

type IconSet = "ionicons" | "material";

export type AppFilterTabItem<T extends string = string> = {
  id: T;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap | string;
  iconSet?: IconSet;
};

type Props<T extends string = string> = {
  items: AppFilterTabItem<T>[];
  selectedValue: T;
  onChangeValue: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
};

export function AppFilterTabs<T extends string = string>({
  items,
  selectedValue,
  onChangeValue,
  className = "",
  fullWidth = false,
}: Props<T>) {
  const renderItem = (item: AppFilterTabItem<T>) => {
    const isActive = selectedValue === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        onPress={() => onChangeValue(item.id)}
        className={[
          "h-10 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm",
          fullWidth ? "flex-1 px-2" : "px-4",
          isActive ? "bg-primary" : "bg-white",
        ].join(" ")}
      >
        {item.icon ? (
          item.iconSet === "material" ? (
            <MaterialCommunityIcons
              name={item.icon as any}
              size={14}
              color={isActive ? "#FFFFFF" : "#18214D"}
            />
          ) : (
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={isActive ? "#FFFFFF" : "#18214D"}
            />
          )
        ) : null}

        <AppText
          numberOfLines={1}
          className={[
            "text-xs",
            isActive ? "text-white" : "text-[#18214D]",
          ].join(" ")}
        >
          {item.title}
        </AppText>
      </TouchableOpacity>
    );
  };

  if (fullWidth) {
    return (
      <View className={["mb-6 w-full flex-row gap-2", className].join(" ")}>
        {items.map(renderItem)}
      </View>
    );
  }

  return (
    <View className={["mb-6", className].join(" ")}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {items.map(renderItem)}
      </ScrollView>
    </View>
  );
}
