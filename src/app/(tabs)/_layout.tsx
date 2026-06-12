import { AppTabBar } from "@/components/layout/AppTabBar";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Ana Sayfa" }} />
      <Tabs.Screen name="my-invitations" options={{ title: "Davetiyelerim" }} />
      <Tabs.Screen name="guests" options={{ title: "Misafirler" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />

      <Tabs.Screen
        name="personal-info"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
