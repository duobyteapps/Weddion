import { AppSwitchCard } from "@/components/common/AppSwitchCard";
import { IllustratedHeroCard } from "@/components/common/IllustratedHeroCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { NotificationChannelsCard } from "@/components/profile/notification-settings/NotificationChannelsCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getCurrentUserNotificationSettings,
  updateCurrentUserNotificationSettings,
  type UpdateNotificationSettingsPayload,
} from "@/services/notificationSettingsService";
import { registerCurrentDeviceForPushNotifications } from "@/services/pushNotificationService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

type NotificationState = UpdateNotificationSettingsPayload;

const DEFAULT_SETTINGS: NotificationState = {
  all_notifications: false,
  app_notifications: true,
  email_notifications: false,
  sms_notifications: false,
  system_notifications: false,
};

function areSettingsEqual(
  firstSettings: NotificationState,
  secondSettings: NotificationState,
) {
  return (
    firstSettings.all_notifications === secondSettings.all_notifications &&
    firstSettings.app_notifications === secondSettings.app_notifications &&
    firstSettings.email_notifications === secondSettings.email_notifications &&
    firstSettings.sms_notifications === secondSettings.sms_notifications &&
    firstSettings.system_notifications === secondSettings.system_notifications
  );
}

function getNextAllNotificationsValue(settings: NotificationState) {
  return (
    settings.app_notifications &&
    settings.email_notifications &&
    settings.sms_notifications &&
    settings.system_notifications
  );
}

function getPushPermissionMessage(reason?: string, message?: string) {
  if (message) {
    return message;
  }

  if (reason === "expo_go") {
    return "Sistem bildirimleri Expo Go içinde test edilemez.\nAndroid için development build alındığında bu özellik çalışacaktır.";
  }

  if (reason === "not_device") {
    return "Telefon bildirimi alabilmek için uygulamayı gerçek cihazda açmanız gerekiyor.";
  }

  if (reason === "missing_project_id") {
    return "Expo projectId bulunamadı.\napp.json içindeki EAS projectId alanını kontrol edin.";
  }

  if (reason === "save_error") {
    return "Bildirim tokenı kaydedilemedi. Lütfen tekrar deneyin.";
  }

  if (reason === "token_error") {
    return "Bildirim tokenı alınamadı. Lütfen tekrar deneyin.";
  }

  return "Telefonunuza bildirim gönderebilmemiz için bildirim izni vermeniz gerekiyor.";
}
export default function NotificationSettingsScreen() {
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [initialSettings, setInitialSettings] =
    useState<NotificationState>(DEFAULT_SETTINGS);

  const [settings, setSettings] = useState<NotificationState>(DEFAULT_SETTINGS);

  const hasChanges = useMemo(() => {
    return !areSettingsEqual(initialSettings, settings);
  }, [initialSettings, settings]);

  function handleServiceError(params: {
    error: unknown;
    fallbackTitle: string;
    fallbackMessage: string;
  }) {
    const message =
      params.error instanceof Error
        ? params.error.message
        : params.fallbackMessage;

    const isSessionExpired = message === SESSION_EXPIRED_MESSAGE;

    showAlert({
      title: isSessionExpired ? "Oturum Süresi Doldu" : params.fallbackTitle,
      message,
      type: isSessionExpired ? "warning" : "error",
      confirmText: isSessionExpired ? "Giriş Yap" : "Tamam",
      onConfirm: () => {
        if (isSessionExpired) {
          router.replace("/auth/login");
        }
      },
    });
  }

  async function ensureSystemNotificationPermission() {
    try {
      const permission = await registerCurrentDeviceForPushNotifications();

      if (!permission.granted) {
        showAlert({
          title: "Bildirim İzni Gerekli",
          message: getPushPermissionMessage(permission.reason),
          type: "warning",
          confirmText: "Tamam",
        });

        return false;
      }

      return true;
    } catch (error) {
      console.log("Push bildirim izni alınamadı:", error);

      showAlert({
        title: "Bildirim İzni Alınamadı",
        message:
          "Telefon bildirimi açılırken bir sorun oluştu. Lütfen tekrar deneyin.",
        type: "error",
        confirmText: "Tamam",
      });

      return false;
    }
  }

  async function loadSettings() {
    try {
      setLoading(true);

      const data = await getCurrentUserNotificationSettings();

      const nextSettings: NotificationState = {
        all_notifications: data.all_notifications,
        app_notifications: data.app_notifications,
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        system_notifications: data.system_notifications,
      };

      const normalizedSettings: NotificationState = {
        ...nextSettings,
        all_notifications: getNextAllNotificationsValue(nextSettings),
      };

      setInitialSettings(normalizedSettings);
      setSettings(normalizedSettings);
    } catch (error) {
      console.log("Bildirim ayarları alınamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Bildirim Ayarları Alınamadı",
        fallbackMessage: "Bildirim ayarları alınamadı.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    try {
      setSaving(true);

      if (settings.system_notifications) {
        const canEnableSystemNotifications =
          await ensureSystemNotificationPermission();

        if (!canEnableSystemNotifications) {
          const nextSettings: NotificationState = {
            ...settings,
            system_notifications: false,
            all_notifications: false,
          };

          setSettings(nextSettings);
          await updateCurrentUserNotificationSettings(nextSettings);
          setInitialSettings(nextSettings);

          return;
        }
      }

      const normalizedSettings: NotificationState = {
        ...settings,
        all_notifications: getNextAllNotificationsValue(settings),
      };

      await updateCurrentUserNotificationSettings(normalizedSettings);

      setSettings(normalizedSettings);
      setInitialSettings(normalizedSettings);

      showAlert({
        title: "Bildirim Ayarları Kaydedildi",
        message: "Bildirim tercihleriniz başarıyla kaydedildi.",
        type: "success",
      });
    } catch (error) {
      console.log("Bildirim ayarları kaydedilemedi:", error);

      handleServiceError({
        error,
        fallbackTitle: "Bildirim Ayarları Kaydedilemedi",
        fallbackMessage: "Bildirim ayarları kaydedilemedi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAllNotifications(value: boolean) {
    if (!value) {
      setSettings({
        all_notifications: false,
        app_notifications: false,
        email_notifications: false,
        sms_notifications: false,
        system_notifications: false,
      });

      return;
    }

    const canEnableSystemNotifications =
      await ensureSystemNotificationPermission();

    setSettings({
      all_notifications: canEnableSystemNotifications,
      app_notifications: true,
      email_notifications: true,
      sms_notifications: true,
      system_notifications: canEnableSystemNotifications,
    });
  }

  function handleAppNotifications(value: boolean) {
    setSettings((currentSettings) => {
      const nextSettings: NotificationState = {
        ...currentSettings,
        app_notifications: value,
      };

      return {
        ...nextSettings,
        all_notifications: getNextAllNotificationsValue(nextSettings),
      };
    });
  }

  function handleEmailNotifications(value: boolean) {
    setSettings((currentSettings) => {
      const nextSettings: NotificationState = {
        ...currentSettings,
        email_notifications: value,
      };

      return {
        ...nextSettings,
        all_notifications: getNextAllNotificationsValue(nextSettings),
      };
    });
  }

  function handleSmsNotifications(value: boolean) {
    setSettings((currentSettings) => {
      const nextSettings: NotificationState = {
        ...currentSettings,
        sms_notifications: value,
      };

      return {
        ...nextSettings,
        all_notifications: getNextAllNotificationsValue(nextSettings),
      };
    });
  }

  async function handleSystemNotifications(value: boolean) {
    if (!value) {
      setSettings((currentSettings) => {
        const nextSettings: NotificationState = {
          ...currentSettings,
          system_notifications: false,
        };

        return {
          ...nextSettings,
          all_notifications: getNextAllNotificationsValue(nextSettings),
        };
      });

      return;
    }

    const canEnableSystemNotifications =
      await ensureSystemNotificationPermission();

    if (!canEnableSystemNotifications) {
      setSettings((currentSettings) => {
        const nextSettings: NotificationState = {
          ...currentSettings,
          system_notifications: false,
        };

        return {
          ...nextSettings,
          all_notifications: getNextAllNotificationsValue(nextSettings),
        };
      });

      return;
    }

    setSettings((currentSettings) => {
      const nextSettings: NotificationState = {
        ...currentSettings,
        system_notifications: true,
      };

      return {
        ...nextSettings,
        all_notifications: getNextAllNotificationsValue(nextSettings),
      };
    });
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader
          title="Bildirim Ayarları"
          description="Hangi bildirimleri almak istediğinizi yönetin."
          backTo="/(tabs)/profile"
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
      >
        <ScreenHeader
          title="Bildirim Ayarları"
          description="Hangi bildirimleri almak istediğinizi yönetin."
          backTo="/(tabs)/profile"
        />

        <IllustratedHeroCard
          title={"Önemli anları\nkaçırmayın"}
          description="Sizin için önemli gelişmeleri zamanında bildirimlerle öğrenin."
          image={require("@/assets/images/illustration/notification-hero.png")}
        />

        <View className="mt-8">
          <AppSwitchCard
            title="Tüm Bildirimler"
            description="Tüm bildirimleri aç veya kapat"
            icon="notifications"
            value={settings.all_notifications}
            onValueChange={handleAllNotifications}
          />
        </View>

        <NotificationChannelsCard
          appNotifications={settings.app_notifications}
          emailNotifications={settings.email_notifications}
          smsNotifications={settings.sms_notifications}
          systemNotifications={settings.system_notifications}
          onChangeAppNotifications={handleAppNotifications}
          onChangeEmailNotifications={handleEmailNotifications}
          onChangeSmsNotifications={handleSmsNotifications}
          onChangeSystemNotifications={handleSystemNotifications}
        />

        <View className="mt-8">
          <AppButton
            title={saving ? "Kaydediliyor..." : "Bildirim Ayarlarını Kaydet"}
            onPress={handleSave}
            loading={saving}
            disabled={!hasChanges || saving}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
