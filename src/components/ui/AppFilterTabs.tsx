import { AppText } from "@/components/ui/AppText";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

type IconSet = "ionicons" | "material" | "feather";
type TabVariant = "primary" | "danger";

export type AppFilterTabItem<T extends string = string> = {
  id: T;
  title: string;
  icon?: string;
  iconSet?: IconSet;
  variant?: TabVariant;
};

type Props<T extends string = string> = {
  items: AppFilterTabItem<T>[];
  selectedValue: T;
  onChangeValue: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
};

function getItemColors(params: { isActive: boolean; variant?: TabVariant }) {
  const { isActive, variant = "primary" } = params;

  if (variant === "danger") {
    return {
      backgroundClassName: isActive ? "bg-error" : "bg-white",
      textClassName: isActive ? "text-white" : "text-error",
      iconColor: isActive ? "#FFFFFF" : "#EF4444",
    };
  }

  return {
    backgroundClassName: isActive ? "bg-primary" : "bg-white",
    textClassName: isActive ? "text-white" : "text-primaryDark",
    iconColor: isActive ? "#FFFFFF" : "#8F5DB9",
  };
}

function renderTabIcon(params: {
  icon?: string;
  iconSet?: IconSet;
  iconColor: string;
}) {
  const { icon, iconSet = "ionicons", iconColor } = params;

  if (!icon) {
    return null;
  }

  if (iconSet === "material") {
    return (
      <MaterialCommunityIcons name={icon as any} size={14} color={iconColor} />
    );
  }

  if (iconSet === "feather") {
    return <Feather name={icon as any} size={14} color={iconColor} />;
  }

  return <Ionicons name={icon as any} size={14} color={iconColor} />;
}

export function AppFilterTabs<T extends string = string>({
  items,
  selectedValue,
  onChangeValue,
  className = "",
  fullWidth = false,
}: Props<T>) {
  const renderItem = (item: AppFilterTabItem<T>) => {
    const isActive = selectedValue === item.id;

    const { backgroundClassName, textClassName, iconColor } = getItemColors({
      isActive,
      variant: item.variant,
    });

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        onPress={() => onChangeValue(item.id)}
        className={[
          "h-10 rounded-xl flex-row items-center justify-center gap-1.5",
          fullWidth ? "flex-1 px-2" : "px-4",
          backgroundClassName,
        ].join(" ")}
      >
        {renderTabIcon({
          icon: item.icon,
          iconSet: item.iconSet,
          iconColor,
        })}

        <AppText
          numberOfLines={1}
          className={["text-xs", textClassName].join(" ")}
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
