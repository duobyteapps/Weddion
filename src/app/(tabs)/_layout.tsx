import { Tabs } from "expo-router";

import { AppTabBar } from "@/components/layout/AppTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Ana Sayfa" }} />
      <Tabs.Screen name="invitations" options={{ title: "Davetiyeler" }} />
      <Tabs.Screen name="guests" options={{ title: "Misafirler" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
