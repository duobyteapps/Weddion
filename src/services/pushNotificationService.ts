import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";

export type PushPermissionFailReason =
  | "expo_go"
  | "not_device"
  | "permission_denied"
  | "missing_project_id";

export type PushPermissionResult =
  | {
      granted: true;
      token: string;
    }
  | {
      granted: false;
      reason: PushPermissionFailReason;
    };

function isRunningInExpoGo() {
  return Constants.executionEnvironment === "storeClient";
}

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export async function requestPushNotificationPermission(): Promise<PushPermissionResult> {
  if (isRunningInExpoGo()) {
    return {
      granted: false,
      reason: "expo_go",
    };
  }

  if (!Device.isDevice) {
    return {
      granted: false,
      reason: "not_device",
    };
  }

  const Notifications = await import("expo-notifications");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Weddion Bildirimleri",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A66BD6",
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const currentPermission = await Notifications.getPermissionsAsync();

  let finalStatus = currentPermission.status;

  if (currentPermission.status !== "granted") {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== "granted") {
    return {
      granted: false,
      reason: "permission_denied",
    };
  }

  const projectId = getExpoProjectId();

  if (!projectId) {
    return {
      granted: false,
      reason: "missing_project_id",
    };
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return {
    granted: true,
    token: tokenResponse.data,
  };
}

export async function saveCurrentUserPushToken(token: string) {
  const user = await getAuthenticatedUser();
  const now = new Date().toISOString();

  const { error } = await supabase.from("user_push_tokens").upsert(
    {
      user_id: user.id,
      expo_push_token: token,
      device_type: Platform.OS,
      is_active: true,
      updated_at: now,
    },
    {
      onConflict: "user_id,expo_push_token",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function registerCurrentDeviceForPushNotifications(): Promise<PushPermissionResult> {
  const permission = await requestPushNotificationPermission();

  if (!permission.granted) {
    return permission;
  }

  await saveCurrentUserPushToken(permission.token);

  return permission;
}
