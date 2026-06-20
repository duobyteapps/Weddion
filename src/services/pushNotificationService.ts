import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";

export type PushPermissionFailReason =
  | "expo_go"
  | "not_device"
  | "permission_denied"
  | "missing_project_id"
  | "token_error"
  | "save_error";

export type PushPermissionResult =
  | {
      granted: true;
      token: string;
    }
  | {
      granted: false;
      reason: PushPermissionFailReason;
      message?: string;
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Bilinmeyen hata oluştu.";
  }
}

export function getPushPermissionErrorMessage(
  reason?: PushPermissionFailReason,
  message?: string,
) {
  if (message) {
    return message;
  }

  switch (reason) {
    case "expo_go":
      return "Sistem bildirimleri Expo Go içinde test edilemez. Production veya development build kullanmalısın.";

    case "not_device":
      return "Telefon bildirimi alabilmek için uygulamayı gerçek cihazda açman gerekiyor.";

    case "permission_denied":
      return "Telefonunuza bildirim gönderebilmemiz için bildirim izni vermeniz gerekiyor.";

    case "missing_project_id":
      return "Expo projectId bulunamadı. app.json içindeki EAS projectId alanını kontrol edin.";

    case "token_error":
      return "Expo push token alınırken hata oluştu.";

    case "save_error":
      return "Push token Supabase'e kaydedilirken hata oluştu.";

    default:
      return "Bildirim izni alınırken bilinmeyen bir hata oluştu.";
  }
}

export async function requestPushNotificationPermission(): Promise<PushPermissionResult> {
  try {
    if (isRunningInExpoGo()) {
      return {
        granted: false,
        reason: "expo_go",
        message:
          "Sistem bildirimleri Expo Go içinde test edilemez. Production veya development build kullanmalısın.",
      };
    }

    if (!Device.isDevice) {
      return {
        granted: false,
        reason: "not_device",
        message:
          "Telefon bildirimi alabilmek için uygulamayı gerçek cihazda açman gerekiyor.",
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
        message:
          "Telefonunuza bildirim gönderebilmemiz için bildirim izni vermeniz gerekiyor.",
      };
    }

    const projectId = getExpoProjectId();

    if (!projectId) {
      return {
        granted: false,
        reason: "missing_project_id",
        message:
          "Expo projectId bulunamadı. app.json içindeki EAS projectId alanını kontrol edin.",
      };
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return {
      granted: true,
      token: tokenResponse.data,
    };
  } catch (error) {
    return {
      granted: false,
      reason: "token_error",
      message: getErrorMessage(error),
    };
  }
}

export async function saveCurrentUserPushToken(
  token: string,
): Promise<PushPermissionResult> {
  try {
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
      return {
        granted: false,
        reason: "save_error",
        message: error.message,
      };
    }

    return {
      granted: true,
      token,
    };
  } catch (error) {
    return {
      granted: false,
      reason: "save_error",
      message: getErrorMessage(error),
    };
  }
}

export async function registerCurrentDeviceForPushNotifications(): Promise<PushPermissionResult> {
  const permission = await requestPushNotificationPermission();

  if (!permission.granted) {
    return permission;
  }

  return saveCurrentUserPushToken(permission.token);
}
