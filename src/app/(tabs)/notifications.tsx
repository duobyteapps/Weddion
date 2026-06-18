import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import { NotificationItemCard } from "@/components/notifications/NotificationItemCard";
import { NotificationSummaryCard } from "@/components/notifications/NotificationSummaryCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getCurrentUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notificationService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import type { UserNotification } from "@/types/notification";

export default function NotificationsScreen() {
  const { showAlert } = useAppAlert();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.is_read).length;
  }, [notifications]);

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

  async function loadNotifications() {
    try {
      setLoading(true);

      const data = await getCurrentUserNotifications();

      setNotifications(data);
    } catch (error) {
      console.log("Bildirimler alınamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Bildirimler Alınamadı",
        fallbackMessage: "Bildirimler alınırken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePressNotification(notification: UserNotification) {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification.id === notification.id
              ? {
                  ...currentNotification,
                  is_read: true,
                }
              : currentNotification,
          ),
        );
      }

      if (
        notification.type === "guest_photo" &&
        notification.related_invitation_id
      ) {
        router.push({
          pathname: "/(tabs)/gallery",
          params: {
            invitationId: notification.related_invitation_id,
          },
        });
      }
    } catch (error) {
      console.log("Bildirim okunamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Bildirim Güncellenemedi",
        fallbackMessage: "Bildirim durumu güncellenemedi.",
      });
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.log("Bildirimler okunmuş yapılamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Bildirimler Güncellenemedi",
        fallbackMessage: "Bildirimler okunmuş yapılamadı.",
      });
    } finally {
      setMarkingAll(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  if (loading) {
    return (
      <ScreenContainer>
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
          title="Bildirimler"
          description="Yeni fotoğraf ve bildirimleri görün."
        />

        <NotificationSummaryCard unreadCount={unreadCount} />

        {unreadCount > 0 && (
          <AppButton
            title={markingAll ? "Güncelleniyor..." : "Tümünü okundu yap"}
            variant="ghost"
            disabled={markingAll}
            onPress={handleMarkAllAsRead}
            className="mb-4"
          />
        )}

        {notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <View className="pb-8">
            {notifications.map((notification) => (
              <NotificationItemCard
                key={notification.id}
                notification={notification}
                onPress={handlePressNotification}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
