import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { GalleryAccountSummaryCard } from "@/components/gallery/account-management/GalleryAccountSummaryCard";
import { GalleryJoinGalleryCard } from "@/components/gallery/account-management/GalleryJoinGalleryCard";
import { GalleryPartnerMembersCard } from "@/components/gallery/account-management/GalleryPartnerMembersCard";
import { GalleryPartnerRequestsCard } from "@/components/gallery/account-management/GalleryPartnerRequestsCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import {
  approveGalleryPartnerRequest,
  getGalleryPartner,
  getMyGalleryAccessibleInvitations,
  getPendingGalleryPartnerRequests,
  leaveGalleryPartnerAccess,
  refreshGalleryPartnerInviteCode,
  rejectGalleryPartnerRequest,
  removeGalleryPartner,
  requestGalleryPartnerAccessByCode,
} from "@/services/galleryPartnerService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import type {
  GalleryAccessibleInvitation,
  GalleryPartner,
  GalleryPartnerRequest,
} from "@/types/galleryPartner";

export default function GalleryAccountManagementScreen() {
  const { showAlert } = useAppAlert();
  const { invitationId } = useLocalSearchParams<{
    invitationId?: string;
  }>();

  const [selectedInvitation, setSelectedInvitation] =
    useState<GalleryAccessibleInvitation | null>(null);

  const [partner, setPartner] = useState<GalleryPartner | null>(null);
  const [joinRequests, setJoinRequests] = useState<GalleryPartnerRequest[]>([]);

  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshingCode, setRefreshingCode] = useState(false);
  const [removingPartner, setRemovingPartner] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  );
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null,
  );

  const isOwner = selectedInvitation?.access_role === "owner";
  const isPartner = selectedInvitation?.access_role === "partner";
  const hasPartner = Boolean(partner);
  const activeMemberCount = selectedInvitation ? (partner ? 2 : 1) : 0;
  const canUseInviteActions = Boolean(isOwner && !hasPartner);

  const shouldShowJoinCard = !selectedInvitation;

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

  async function fetchGalleryDetails(
    targetInvitation: GalleryAccessibleInvitation,
  ) {
    const activePartner = await getGalleryPartner(targetInvitation.id);
    setPartner(activePartner);

    if (targetInvitation.access_role === "owner") {
      const pendingRequests =
        activePartner === null
          ? await getPendingGalleryPartnerRequests(targetInvitation.id)
          : [];

      setJoinRequests(pendingRequests);
      return;
    }

    setJoinRequests([]);
  }

  async function loadGalleryAccount() {
    try {
      setLoading(true);

      const routeInvitationId =
        typeof invitationId === "string" ? invitationId : undefined;

      if (!routeInvitationId) {
        setSelectedInvitation(null);
        setPartner(null);
        setJoinRequests([]);
        return;
      }

      const accessibleInvitations =
        (await getMyGalleryAccessibleInvitations()) as GalleryAccessibleInvitation[];

      const targetInvitation =
        accessibleInvitations.find((item) => item.id === routeInvitationId) ??
        null;

      setSelectedInvitation(targetInvitation);

      if (!targetInvitation) {
        setPartner(null);
        setJoinRequests([]);
        return;
      }

      await fetchGalleryDetails(targetInvitation);
    } catch (error) {
      console.log("Galeri hesabı alınamadı:", error);

      setSelectedInvitation(null);
      setPartner(null);
      setJoinRequests([]);

      handleServiceError({
        error,
        fallbackTitle: "Galeri Hesabı Hatası",
        fallbackMessage:
          "Galeri hesabı bilgileri alınırken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function refreshGalleryAccountSilently() {
    const routeInvitationId =
      typeof invitationId === "string" ? invitationId : undefined;

    if (!routeInvitationId) {
      setSelectedInvitation(null);
      setPartner(null);
      setJoinRequests([]);
      return;
    }

    const accessibleInvitations =
      (await getMyGalleryAccessibleInvitations()) as GalleryAccessibleInvitation[];

    const targetInvitation =
      accessibleInvitations.find((item) => item.id === routeInvitationId) ??
      null;

    setSelectedInvitation(targetInvitation);

    if (!targetInvitation) {
      setPartner(null);
      setJoinRequests([]);
      return;
    }

    await fetchGalleryDetails(targetInvitation);
  }

  useFocusEffect(
    useCallback(() => {
      loadGalleryAccount();
    }, [invitationId]),
  );

  async function handleCopyInviteCode() {
    const code = selectedInvitation?.gallery_partner_invite_code;

    if (!code || !canUseInviteActions) {
      return;
    }

    await Clipboard.setStringAsync(code);

    showAlert({
      title: "Davet Kodu Kopyalandı",
      message: "Galeri davet kodunu partnerinle paylaşabilirsin.",
      type: "success",
      confirmText: "Tamam",
    });
  }

  async function handleShareInviteCode() {
    const code = selectedInvitation?.gallery_partner_invite_code;

    if (!code || !canUseInviteActions) {
      return;
    }

    await Share.share({
      message: `Weddion galeri ortağı olmak için davet kodum: ${code}`,
    });
  }

  function handleRefreshInviteCode() {
    if (!selectedInvitation || !canUseInviteActions) {
      return;
    }

    showAlert({
      title: "Davet Kodu Yenilensin mi?",
      message:
        "Mevcut davet kodu geçersiz olur. Yeni kodu tekrar paylaşman gerekir.",
      type: "warning",
      confirmText: "Yenile",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setRefreshingCode(true);

          await refreshGalleryPartnerInviteCode(selectedInvitation.id);
          await refreshGalleryAccountSilently();

          showAlert({
            title: "Davet Kodu Yenilendi",
            message: "Yeni galeri davet kodunu partnerinle paylaşabilirsin.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Davet Kodu Hatası",
            fallbackMessage:
              "Davet kodu yenilenirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          setRefreshingCode(false);
        }
      },
    });
  }

  async function handleJoinGallery() {
    const normalizedCode = joinCode.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      showAlert({
        title: "Davet Kodu Eksik",
        message: "Lütfen geçerli bir davet kodu girin.",
        type: "warning",
        confirmText: "Tamam",
      });
      return;
    }

    try {
      setJoining(true);

      await requestGalleryPartnerAccessByCode({
        code: normalizedCode,
        displayName,
      });

      setJoinCode("");
      setDisplayName("");

      showAlert({
        title: "Katılma İsteği Gönderildi",
        message:
          "Galeri sahibi isteğini onayladığında bu galeriye erişebileceksin.",
        type: "success",
        confirmText: "Tamam",
      });
    } catch (error) {
      handleServiceError({
        error,
        fallbackTitle: "Katılma İsteği Hatası",
        fallbackMessage:
          "Galeriye katılma isteği gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setJoining(false);
    }
  }

  function handleApproveJoinRequest(request: GalleryPartnerRequest) {
    showAlert({
      title: "Katılma İsteği Onaylansın mı?",
      message:
        "Bu kişi galeri fotoğraflarını görebilecek, indirebilecek ve silebilecek.",
      type: "warning",
      confirmText: "Onayla",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setApprovingRequestId(request.id);

          await approveGalleryPartnerRequest(request.id);
          await refreshGalleryAccountSilently();

          showAlert({
            title: "Katılma İsteği Onaylandı",
            message: "Kişi galeri ortağı olarak eklendi.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Onaylama Hatası",
            fallbackMessage:
              "Katılma isteği onaylanırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          setApprovingRequestId(null);
        }
      },
    });
  }

  function handleRejectJoinRequest(request: GalleryPartnerRequest) {
    showAlert({
      title: "Katılma İsteği Reddedilsin mi?",
      message: "Bu kişi galeri ortağı olarak eklenmeyecek.",
      type: "warning",
      confirmText: "Reddet",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setRejectingRequestId(request.id);

          await rejectGalleryPartnerRequest(request.id);
          await refreshGalleryAccountSilently();

          showAlert({
            title: "Katılma İsteği Reddedildi",
            message: "Kişi galeri ortağı olarak eklenmedi.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Reddetme Hatası",
            fallbackMessage:
              "Katılma isteği reddedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          setRejectingRequestId(null);
        }
      },
    });
  }

  function handleRemovePartner() {
    if (!selectedInvitation || !partner) {
      return;
    }

    showAlert({
      title: "Galeri Ortağı Kaldırılsın mı?",
      message:
        "Bu kişi artık galeri fotoğraflarını göremez, indiremez ve silemez.",
      type: "warning",
      confirmText: "Kaldır",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setRemovingPartner(true);

          await removeGalleryPartner({
            invitationId: selectedInvitation.id,
            partnerUserId: partner.partnerUserId,
          });

          await refreshGalleryAccountSilently();

          showAlert({
            title: "Galeri Ortağı Kaldırıldı",
            message: "Kişinin galeri erişimi kaldırıldı.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Ortak Kaldırma Hatası",
            fallbackMessage:
              "Galeri ortağı kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          setRemovingPartner(false);
        }
      },
    });
  }

  function handleLeaveGallery() {
    if (!selectedInvitation) {
      return;
    }

    showAlert({
      title: "Bu Galeriden Ayrıl?",
      message:
        "Bu galeriden ayrılırsan fotoğrafları artık göremez, indiremez ve silemezsin.",
      type: "warning",
      confirmText: "Ayrıl",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setLeaving(true);

          await leaveGalleryPartnerAccess(selectedInvitation.id);
          await loadGalleryAccount();

          showAlert({
            title: "Galeriden Ayrıldın",
            message: "Galeri erişimin kaldırıldı.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Ayrılma Hatası",
            fallbackMessage:
              "Galeriden ayrılırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          setLeaving(false);
        }
      },
    });
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <ScreenHeader
            title="Galeri Hesabı Yönetimi"
            description="Galeri ortağınızı birlikte yönetin."
            backTo="/(tabs)/my-invitations"
          />

          {loading ? (
            <View className="mt-10 items-center justify-center">
              <ActivityIndicator color={Colors.primary} />

              <AppText className="mt-3 text-textMuted">
                Galeri hesabı hazırlanıyor...
              </AppText>
            </View>
          ) : (
            <>
              <GalleryAccountSummaryCard
                selectedInvitation={selectedInvitation}
                hasPartner={hasPartner}
                isOwner={isOwner}
                isPartner={isPartner}
                activeMemberCount={activeMemberCount}
                canUseInviteActions={canUseInviteActions}
                refreshingCode={refreshingCode}
                leaving={leaving}
                onCopyInviteCode={handleCopyInviteCode}
                onShareInviteCode={handleShareInviteCode}
                onRefreshInviteCode={handleRefreshInviteCode}
                onLeaveGallery={handleLeaveGallery}
              />

              <GalleryPartnerRequestsCard
                isOwner={isOwner}
                hasPartner={hasPartner}
                joinRequests={joinRequests}
                approvingRequestId={approvingRequestId}
                rejectingRequestId={rejectingRequestId}
                onApproveJoinRequest={handleApproveJoinRequest}
                onRejectJoinRequest={handleRejectJoinRequest}
              />

              <GalleryPartnerMembersCard
                selectedInvitation={selectedInvitation}
                partner={partner}
                isOwner={isOwner}
                removingPartner={removingPartner}
                onRemovePartner={handleRemovePartner}
              />

              <GalleryJoinGalleryCard
                shouldShowJoinCard={shouldShowJoinCard}
                hasPartner={hasPartner}
                isPartner={isPartner}
                joinCode={joinCode}
                joining={joining}
                onChangeJoinCode={setJoinCode}
                onJoinGallery={handleJoinGallery}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
