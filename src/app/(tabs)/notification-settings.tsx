import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

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
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";

type NotificationState = UpdateNotificationSettingsPayload;

const DEFAULT_SETTINGS: NotificationState = {
  all_notifications: true,
  app_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  system_notifications: true,
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
  const allChannelsOpen =
    settings.app_notifications &&
    settings.email_notifications &&
    settings.sms_notifications &&
    settings.system_notifications;

  const allChannelsClosed =
    !settings.app_notifications &&
    !settings.email_notifications &&
    !settings.sms_notifications &&
    !settings.system_notifications;

  if (allChannelsOpen) {
    return true;
  }

  if (allChannelsClosed) {
    return false;
  }

  return settings.all_notifications;
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

      await updateCurrentUserNotificationSettings(settings);

      setInitialSettings(settings);

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

  function handleAllNotifications(value: boolean) {
    setSettings({
      all_notifications: value,
      app_notifications: value,
      email_notifications: value,
      sms_notifications: value,
      system_notifications: value,
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

  function handleSystemNotifications(value: boolean) {
    setSettings((currentSettings) => {
      const nextSettings: NotificationState = {
        ...currentSettings,
        system_notifications: value,
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
