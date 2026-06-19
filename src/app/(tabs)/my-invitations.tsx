import { router, useFocusEffect } from "expo-router";

import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { IllustratedHeroCard } from "@/components/common/IllustratedHeroCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { MyInvitationsList } from "@/components/invitations/my/MyInvitationsList";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { MAX_USER_INVITATION_COUNT } from "@/constants/invitationLimits";
import {
  deleteUserInvitation,
  getCurrentUserInvitationCount,
  getCurrentUserInvitations,
} from "@/services/invitationService";

import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { UserInvitation } from "@/types/invitation";

function getInvitationRouteParams(invitation: UserInvitation) {
  return {
    templateId: invitation.template_id,
    invitationId: invitation.id,
    shareSlug: invitation.share_slug,
    invitationImageUrl: invitation.invitation_image_url ?? "",

    eventTypeId: invitation.event_type_id,
    invitationName: invitation.invitation_name ?? "",

    guestUploadCode: invitation.guest_upload_code ?? "",
    guestUploadSlug: invitation.guest_upload_slug ?? "",
    guestUploadQrValue: invitation.guest_upload_qr_value ?? "",

    brideName: invitation.bride_name,
    groomName: invitation.groom_name,
    brideParents: invitation.bride_parents ?? "",
    groomParents: invitation.groom_parents ?? "",
    brideSurname: invitation.bride_surname ?? "",
    groomSurname: invitation.groom_surname ?? "",
    date: invitation.event_date,
    time: invitation.event_time ?? "",
    description: invitation.description ?? "",
    venueName: invitation.venue_name ?? "",
    venueLocation: invitation.venue_location ?? "",
  };
}

function getInvitationDisplayName(invitation: UserInvitation) {
  const invitationName = invitation.invitation_name?.trim();

  if (invitationName) {
    return invitationName;
  }

  const brideName = invitation.bride_name?.trim();
  const groomName = invitation.groom_name?.trim();
  const eventTypeTitle = invitation.invitation_event_types?.title?.trim();

  const coupleName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || "";

  const fallbackTitle = [coupleName, eventTypeTitle].filter(Boolean).join(" ");

  return fallbackTitle || "İsimsiz Davetiye";
}

export default function MyInvitationsScreen() {
  const { showAlert } = useAppAlert();

  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedInvitationsRef = useRef(false);

  const handleServiceError = useCallback(
    (params: {
      error: unknown;
      fallbackTitle: string;
      fallbackMessage: string;
    }) => {
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
    },
    [showAlert],
  );

  const fetchInvitations = useCallback(
    async (options?: { showInitialLoading?: boolean }) => {
      try {
        if (options?.showInitialLoading) {
          setLoading(true);
        }

        const data = await getCurrentUserInvitations();
        setInvitations(data);
      } catch (error) {
        console.log("Davetiyeler alınamadı:", error);
        setInvitations([]);

        handleServiceError({
          error,
          fallbackTitle: "Davetiyeler alınamadı",
          fallbackMessage:
            "Davetiyeler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
        });
      } finally {
        hasLoadedInvitationsRef.current = true;
        setLoading(false);
      }
    },
    [handleServiceError],
  );

  useFocusEffect(
    useCallback(() => {
      fetchInvitations({
        showInitialLoading: !hasLoadedInvitationsRef.current,
      });
    }, [fetchInvitations]),
  );

  async function handleRefresh() {
    try {
      setRefreshing(true);

      const data = await getCurrentUserInvitations();
      setInvitations(data);
    } catch (error) {
      console.log("Davetiyeler yenilenemedi:", error);

      handleServiceError({
        error,
        fallbackTitle: "Yenileme başarısız",
        fallbackMessage:
          "Davetiyeler yenilenirken bir sorun oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateInvitation() {
    try {
      const invitationCount = await getCurrentUserInvitationCount();

      if (invitationCount >= MAX_USER_INVITATION_COUNT) {
        showAlert({
          title: "Davetiye limiti doldu",
          message: `Her hesap en fazla ${MAX_USER_INVITATION_COUNT} davetiye oluşturabilir. Yeni davetiye oluşturmak için mevcut davetiyelerden birini silebilirsiniz.`,
          type: "warning",
          confirmText: "Tamam",
        });
        return;
      }

      router.push("/invitation-select");
    } catch (error) {
      console.log("Davetiye limiti kontrol edilemedi:", error);

      showAlert({
        title: "İşlem yapılamadı",
        message:
          "Davetiye oluşturma hakkınız kontrol edilirken bir sorun oluştu.",
        type: "error",
        confirmText: "Tamam",
      });
    }
  }

  function handleEditInvitation(invitation: UserInvitation) {
    router.push({
      pathname: "/invitation-flow/[templateId]/edit",
      params: getInvitationRouteParams(invitation),
    });
  }

  function handleShareInvitation(invitation: UserInvitation) {
    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: getInvitationRouteParams(invitation),
    });
  }

  function handleOpenGallery(invitation: UserInvitation) {
    router.push({
      pathname: "/gallery",
      params: {
        invitationId: invitation.id,
      },
    });
  }

  async function deleteInvitation(invitation: UserInvitation) {
    try {
      await deleteUserInvitation(invitation.id);

      setInvitations((currentInvitations) =>
        currentInvitations.filter((item) => item.id !== invitation.id),
      );

      showAlert({
        title: "Davetiye silindi",
        message: "Davetiye başarıyla silindi.",
        type: "success",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log("Davetiye silinemedi:", error);

      handleServiceError({
        error,
        fallbackTitle: "Davetiye silinemedi",
        fallbackMessage:
          "Davetiye silinirken bir sorun oluştu. Lütfen tekrar deneyin.",
      });
    }
  }

  function handleDeleteInvitation(invitation: UserInvitation) {
    const invitationDisplayName = getInvitationDisplayName(invitation);

    showAlert({
      title: "Davetiyeyi sil",
      message: `${invitationDisplayName} davetiyesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      type: "warning",
      confirmText: "Sil",
      cancelText: "İptal",
      onConfirm: () => {
        deleteInvitation(invitation);
      },
    });
  }

  function handleMenuPress(invitation: UserInvitation) {
    const invitationDisplayName = getInvitationDisplayName(invitation);

    showAlert({
      title: "Davetiye İşlemleri",
      message: `${invitationDisplayName} davetiyesi için işlemler daha sonra aktif edilecek.`,
      type: "info",
      confirmText: "Tamam",
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A875D1" />
          <AppText className="mt-3">Davetiyeleriniz hazırlanıyor...</AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A875D1"
          />
        }
      >
        <ScreenHeader
          title="Davetlerim"
          description="Oluşturduğunuz tüm davetleri buradan görüntüleyebilirsiniz."
        />

        <IllustratedHeroCard
          title={"Özel gününüzü\npaylaşın"}
          description="Davetiyelerinizi yönetebilir, paylaşabilir ve misafirlerinizi davet edebilirsiniz."
          image={require("@/assets/images/illustration/invitations-hero.png")}
        />

        <MyInvitationsList
          invitations={invitations}
          onEditPress={handleEditInvitation}
          onSharePress={handleShareInvitation}
          onDeletePress={handleDeleteInvitation}
          onOpenGalleryPress={handleOpenGallery}
          onMenuPress={handleMenuPress}
          onCreatePress={handleCreateInvitation}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
