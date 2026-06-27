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
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
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
import type { UserInvitation } from "@/types/invitation";

type GalleryAccessRole = "owner" | "partner";

type GalleryAccessibleInvitation = UserInvitation & {
  owner_user_id?: string | null;
  access_role?: GalleryAccessRole;
  gallery_partner_invite_code?: string | null;
  gallery_partner_invite_enabled?: boolean | null;
};

type GalleryPartner = {
  id: string;
  invitationId: string;
  partnerUserId: string;
  role: "partner";
  status: "active" | "removed" | "left";
  createdAt: string;
};

type GalleryPartnerRequest = {
  id: string;
  invitationId: string;
  requesterUserId: string;
  requesterDisplayName: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
};

function formatGalleryTitle(invitation?: GalleryAccessibleInvitation | null) {
  if (!invitation) {
    return "Galeri Hesabı";
  }

  const invitationName = invitation.invitation_name?.trim();

  if (invitationName) {
    return invitationName;
  }

  const brideName = invitation.bride_name?.trim();
  const groomName = invitation.groom_name?.trim();

  if (brideName && groomName) {
    return `${brideName} & ${groomName}`;
  }

  return brideName || groomName || "İsimsiz Galeri";
}

function getAccessRoleLabel(role?: string | null) {
  if (role === "owner") {
    return "Sahip";
  }

  if (role === "partner") {
    return "Ortak";
  }

  return "Galeri";
}

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

  function renderGallerySummaryCard() {
    if (!selectedInvitation) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <AppText variant="title" className="text-textDark">
                Galerim
              </AppText>

              <AppText className="mt-1 text-textMuted">
                {activeMemberCount} kişi yönetiyor
              </AppText>
            </View>

            <View className="rounded-full bg-primary/10 px-4 py-2">
              <AppText variant="captionStrong" className="text-primary">
                {getAccessRoleLabel(selectedInvitation.access_role)}
              </AppText>
            </View>
          </View>

          {isOwner ? (
            <>
              <View>
                <AppText variant="captionStrong" className="text-primary">
                  Davet kodu
                </AppText>

                <View className="mt-2 rounded-2xl border border-border bg-backgroundSoft p-4">
                  <AppText variant="title" className="text-textDark">
                    {hasPartner
                      ? "Zaten ortak galerindesin"
                      : (selectedInvitation.gallery_partner_invite_code ??
                        "Kod yok")}
                  </AppText>
                </View>
              </View>

              <AppButton
                title="Davet Kodunu Kopyala"
                variant="secondary"
                disabled={!canUseInviteActions}
                onPress={handleCopyInviteCode}
              />

              <AppButton
                title="Davet Kodunu Paylaş"
                disabled={!canUseInviteActions}
                onPress={handleShareInviteCode}
              />

              <AppButton
                title="Davet Kodunu Yenile"
                variant="ghost"
                disabled={!canUseInviteActions}
                loading={refreshingCode}
                onPress={handleRefreshInviteCode}
              />
            </>
          ) : null}

          {isPartner ? (
            <AppButton
              title="Bu Galeriden Ayrıl"
              variant="ghost"
              loading={leaving}
              onPress={handleLeaveGallery}
            />
          ) : null}
        </View>
      </AppCard>
    );
  }

  function renderMembersCard() {
    if (!selectedInvitation) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <AppText variant="title" className="text-textDark">
            Galeri Ortakları
          </AppText>

          <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View>
                <AppText variant="captionStrong" className="text-primary">
                  Galeri Sahibi
                </AppText>

                <AppText className="mt-1 text-textMuted">Hesap sahibi</AppText>
              </View>

              <View className="rounded-full bg-background px-4 py-2">
                <AppText variant="captionStrong" className="text-green-700">
                  Sahip
                </AppText>
              </View>
            </View>
          </View>

          {partner ? (
            <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
              <View className="flex-row items-center justify-between gap-3">
                <View>
                  <AppText variant="captionStrong" className="text-primary">
                    Galeri Ortağı
                  </AppText>

                  <AppText className="mt-1 text-textMuted">
                    Aktif galeri ortağı
                  </AppText>
                </View>

                <View className="rounded-full bg-background px-4 py-2">
                  <AppText variant="captionStrong" className="text-amber-700">
                    Ortak
                  </AppText>
                </View>
              </View>

              {isOwner ? (
                <AppButton
                  title="Partneri Kaldır"
                  variant="ghost"
                  className="mt-3"
                  loading={removingPartner}
                  onPress={handleRemovePartner}
                />
              ) : null}
            </View>
          ) : (
            <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
              <AppText variant="captionStrong" className="text-primary">
                Galeri Ortağı
              </AppText>

              <AppText className="mt-1 text-textMuted">
                Henüz galeri ortağı yok.
              </AppText>
            </View>
          )}
        </View>
      </AppCard>
    );
  }

  function renderJoinRequestsCard() {
    if (!isOwner || hasPartner || joinRequests.length === 0) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <AppText variant="title" className="text-textDark">
            Bekleyen Katılma İstekleri
          </AppText>

          {joinRequests.map((request) => {
            const requesterName =
              request.requesterDisplayName?.trim() || "Bir kullanıcı";

            return (
              <View
                key={request.id}
                className="rounded-2xl border border-border bg-backgroundSoft p-4"
              >
                <AppText variant="captionStrong" className="text-textDark">
                  {requesterName}
                </AppText>

                <AppText className="mt-1 text-textMuted">
                  Galeriye ortak olarak erişmek istiyor.
                </AppText>

                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1">
                    <AppButton
                      title="Reddet"
                      variant="ghost"
                      loading={rejectingRequestId === request.id}
                      onPress={() => handleRejectJoinRequest(request)}
                    />
                  </View>

                  <View className="flex-1">
                    <AppButton
                      title="Onayla"
                      loading={approvingRequestId === request.id}
                      onPress={() => handleApproveJoinRequest(request)}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>
    );
  }

  function renderJoinCard() {
    if (!shouldShowJoinCard) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View>
            <AppText variant="title" className="text-textDark">
              Davet Kodu ile Katıl
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Sana verilen davet kodunu girerek aynı galeriye katılabilirsin.
            </AppText>
          </View>

          <AppInput
            label="Adın"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Örn. Nisa"
            autoCapitalize="words"
          />

          <AppInput
            label="Davet kodu"
            value={joinCode}
            onChangeText={(value) => setJoinCode(value.toUpperCase())}
            placeholder="Davet kodu"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />

          <AppButton
            title="Galeriye Katıl"
            loading={joining}
            onPress={handleJoinGallery}
          />
        </View>
      </AppCard>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title="Galeri Hesabı Yönetimi"
        description="Galeri ortağınızı birlikte yönetin."
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="mt-10 items-center justify-center">
              <ActivityIndicator />

              <AppText className="mt-3 text-textMuted">
                Galeri hesabı hazırlanıyor...
              </AppText>
            </View>
          ) : (
            <>
              {renderGallerySummaryCard()}
              {renderMembersCard()}
              {renderJoinRequestsCard()}
              {renderJoinCard()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
