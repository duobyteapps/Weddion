import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type IconName = keyof typeof Ionicons.glyphMap;

type AppTabRoute = {
  key: string;
  name: string;
};

type AppTabBarProps = {
  state: {
    index: number;
    routes: AppTabRoute[];
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        href?: string | null;
      };
    }
  >;
  navigation: {
    navigate: (name: string) => void;
  };
};

const ACTIVE_COLOR = "#A875D1";
const PASSIVE_COLOR = "#817A90";

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  home: {
    active: "home",
    inactive: "home-outline",
  },
  "my-invitations": {
    active: "mail",
    inactive: "mail-outline",
  },
  "dowry-summary": {
    active: "gift",
    inactive: "gift-outline",
  },
  profile: {
    active: "person",
    inactive: "person-outline",
  },
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;

    return options?.href !== null && TAB_ICONS[route.name];
  });

  const firstTabs = visibleRoutes.slice(0, 2);
  const lastTabs = visibleRoutes.slice(2);

  const handleCreatePress = () => {
    router.push("/invitation-select");
  };

  const isRouteActive = (routeName: string) => {
    const activeRoute = state.routes[state.index];

    return activeRoute?.name === routeName;
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between bg-surface px-3 pb-5 pt-3 shadow-sm">
      {firstTabs.map((route) => (
        <TabItem
          key={route.key}
          routeName={route.name}
          label={descriptors[route.key]?.options.title ?? route.name}
          active={isRouteActive(route.name)}
          onPress={() => navigation.navigate(route.name)}
        />
      ))}

      <Pressable
        onPress={handleCreatePress}
        className="-mt-10 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      {lastTabs.map((route) => (
        <TabItem
          key={route.key}
          routeName={route.name}
          label={descriptors[route.key]?.options.title ?? route.name}
          active={isRouteActive(route.name)}
          onPress={() => navigation.navigate(route.name)}
        />
      ))}
    </View>
  );
}

type TabItemProps = {
  routeName: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabItem({ routeName, label, active, onPress }: TabItemProps) {
  const iconSet = TAB_ICONS[routeName];

  if (!iconSet) return null;

  const color = active ? ACTIVE_COLOR : PASSIVE_COLOR;

  return (
    <Pressable
      onPress={onPress}
      className="w-[72px] items-center justify-center gap-1"
    >
      <Ionicons
        name={active ? iconSet.active : iconSet.inactive}
        size={24}
        color={color}
      />

      <AppText variant="caption" className="!text-[10px]" style={{ color }}>
        {label}
      </AppText>
    </Pressable>
  );
}
