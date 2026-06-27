import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import type {
  GalleryAccessibleInvitation,
  GalleryPartner,
  GalleryPartnerRequest,
} from "@/types/invitation";
import { useFocusEffect } from "expo-router";

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
    return "Galeri Sahibi";
  }

  if (role === "partner") {
    return "Galeri Ortağı";
  }

  return "Galeri";
}

export default function GalleryAccountManagementScreen() {
  const { showAlert } = useAppAlert();
  const { invitationId } = useLocalSearchParams<{
    invitationId?: string;
  }>();

  const [invitations, setInvitations] = useState<GalleryAccessibleInvitation[]>(
    [],
  );
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | undefined
  >(typeof invitationId === "string" ? invitationId : undefined);

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

  const selectedInvitation = useMemo(() => {
    return invitations.find((item) => item.id === selectedInvitationId) ?? null;
  }, [invitations, selectedInvitationId]);

  const accessRole = selectedInvitation?.access_role;
  const isOwner = accessRole === "owner";
  const isPartner = accessRole === "partner";
  const hasPartner = Boolean(partner);

  const ownerInvitations = useMemo(() => {
    return invitations.filter((item) => item.access_role === "owner");
  }, [invitations]);

  const partnerInvitations = useMemo(() => {
    return invitations.filter((item) => item.access_role === "partner");
  }, [invitations]);

  const canShowJoinCard = !selectedInvitation || (!isOwner && !isPartner);
  const canUseInviteActions = Boolean(isOwner && !hasPartner);

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

  async function loadGalleryAccount() {
    try {
      setLoading(true);

      const accessibleInvitations = await getMyGalleryAccessibleInvitations();

      setInvitations(accessibleInvitations);

      const routeInvitationId =
        typeof invitationId === "string" ? invitationId : undefined;

      const nextSelectedInvitation =
        accessibleInvitations.find((item) => item.id === routeInvitationId) ??
        accessibleInvitations.find(
          (item) => item.id === selectedInvitationId,
        ) ??
        accessibleInvitations[0] ??
        null;

      setSelectedInvitationId(nextSelectedInvitation?.id);

      if (!nextSelectedInvitation) {
        setPartner(null);
        setJoinRequests([]);
        return;
      }

      const activePartner = await getGalleryPartner(nextSelectedInvitation.id);
      setPartner(activePartner);

      if (nextSelectedInvitation.access_role === "owner") {
        const pendingRequests =
          activePartner === null
            ? await getPendingGalleryPartnerRequests(nextSelectedInvitation.id)
            : [];

        setJoinRequests(pendingRequests);
      } else {
        setJoinRequests([]);
      }
    } catch (error) {
      console.log("Galeri hesabı alınamadı:", error);

      setInvitations([]);
      setSelectedInvitationId(undefined);
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
    const accessibleInvitations = await getMyGalleryAccessibleInvitations();

    setInvitations(accessibleInvitations);

    const nextSelectedInvitation =
      accessibleInvitations.find((item) => item.id === selectedInvitationId) ??
      accessibleInvitations[0] ??
      null;

    setSelectedInvitationId(nextSelectedInvitation?.id);

    if (!nextSelectedInvitation) {
      setPartner(null);
      setJoinRequests([]);
      return;
    }

    const activePartner = await getGalleryPartner(nextSelectedInvitation.id);
    setPartner(activePartner);

    if (nextSelectedInvitation.access_role === "owner") {
      const pendingRequests =
        activePartner === null
          ? await getPendingGalleryPartnerRequests(nextSelectedInvitation.id)
          : [];

      setJoinRequests(pendingRequests);
    } else {
      setJoinRequests([]);
    }
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
      title: "Galeri Kodu Kopyalandı",
      message: "Galeri ortak kodunu partnerinle paylaşabilirsin.",
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
      message: `Weddion galeri ortağı olmak için kodum: ${code}`,
    });
  }

  function handleRefreshInviteCode() {
    if (!selectedInvitation || !canUseInviteActions) {
      return;
    }

    showAlert({
      title: "Galeri Kodu Yenilensin mi?",
      message:
        "Mevcut galeri ortak kodu geçersiz olur. Yeni kodu partnerinle tekrar paylaşman gerekir.",
      type: "warning",
      confirmText: "Yenile",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setRefreshingCode(true);

          await refreshGalleryPartnerInviteCode(selectedInvitation.id);
          await refreshGalleryAccountSilently();

          showAlert({
            title: "Galeri Kodu Yenilendi",
            message: "Yeni galeri ortak kodunu partnerinle paylaşabilirsin.",
            type: "success",
            confirmText: "Tamam",
          });
        } catch (error) {
          handleServiceError({
            error,
            fallbackTitle: "Kod Yenileme Hatası",
            fallbackMessage:
              "Galeri ortak kodu yenilenirken bir hata oluştu. Lütfen tekrar deneyin.",
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
        title: "Galeri Kodu Eksik",
        message: "Lütfen geçerli bir galeri ortak kodu girin.",
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
        "Bu kişi galeri fotoğraflarını görebilecek, indirebilecek ve silebilecek. Davetiyeyi düzenleyemeyecek.",
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
              "Galeri katılma isteği onaylanırken bir hata oluştu. Lütfen tekrar deneyin.",
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
              "Galeri katılma isteği reddedilirken bir hata oluştu. Lütfen tekrar deneyin.",
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
      title: "Galeriden Ayrıl?",
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

  function handleOpenGallery() {
    if (!selectedInvitation) {
      router.replace("/gallery");
      return;
    }

    router.replace({
      pathname: "/gallery",
      params: {
        invitationId: selectedInvitation.id,
      },
    });
  }

  function renderSummaryCard() {
    if (!selectedInvitation) {
      return (
        <AppCard className="mt-5">
          <View className="gap-2">
            <AppText variant="title" className="text-textDark">
              Galeri Hesabı
            </AppText>

            <AppText className="text-textMuted">
              Henüz erişebildiğin bir galeri yok. Sana verilen galeri ortak
              kodunu girerek katılma isteği gönderebilirsin.
            </AppText>
          </View>
        </AppCard>
      );
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-3">
          <View>
            <AppText variant="title" className="text-textDark">
              {formatGalleryTitle(selectedInvitation)}
            </AppText>

            <AppText className="mt-1 text-textMuted">
              {getAccessRoleLabel(selectedInvitation.access_role)}
            </AppText>
          </View>

          <AppButton
            title="Galeriye Git"
            variant="secondary"
            onPress={handleOpenGallery}
          />
        </View>
      </AppCard>
    );
  }

  function renderOwnerInviteCard() {
    if (!isOwner || !selectedInvitation) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Galeri Ortak Kodu
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Bu kodu yalnızca galeriye ortak olacak kişiyle paylaş. Partner
              fotoğrafları görebilir, indirebilir ve silebilir; davetiyeyi
              düzenleyemez.
            </AppText>
          </View>

          <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
            <AppText variant="captionStrong" className="text-primaryDark">
              Davet Kodu
            </AppText>

            <AppText variant="title" className="mt-1 text-textDark">
              {selectedInvitation.gallery_partner_invite_code ?? "Kod yok"}
            </AppText>

            {hasPartner ? (
              <AppText className="mt-2 text-textMuted">
                Bu galeride zaten bir partner var. Yeni bir partner eklemek için
                önce mevcut partneri kaldırmalısın.
              </AppText>
            ) : null}
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppButton
                title="Kopyala"
                variant="secondary"
                disabled={!canUseInviteActions}
                onPress={handleCopyInviteCode}
              />
            </View>

            <View className="flex-1">
              <AppButton
                title="Paylaş"
                variant="secondary"
                disabled={!canUseInviteActions}
                onPress={handleShareInviteCode}
              />
            </View>
          </View>

          <AppButton
            title="Kodu Yenile"
            variant="ghost"
            disabled={!canUseInviteActions}
            loading={refreshingCode}
            onPress={handleRefreshInviteCode}
          />
        </View>
      </AppCard>
    );
  }

  function renderJoinGalleryCard() {
    if (!canShowJoinCard) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Galeriye Katıl
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Sana verilen galeri ortak kodunu gir. Galeri sahibi isteğini
              onayladığında fotoğraflara erişebilirsin.
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
            label="Galeri Ortak Kodu"
            value={joinCode}
            onChangeText={(value) => setJoinCode(value.toUpperCase())}
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />

          <AppButton
            title="Katılma İsteği Gönder"
            loading={joining}
            onPress={handleJoinGallery}
          />
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
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Bekleyen Katılma İstekleri
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Galeri ortağı olmak isteyen kişileri buradan onaylayabilir veya
              reddedebilirsin.
            </AppText>
          </View>

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

  function renderMembersCard() {
    if (!selectedInvitation) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Galeri Üyeleri
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Bu galeriye erişebilecek kişi sayısı en fazla 2 kişidir.
            </AppText>
          </View>

          <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
            <AppText variant="captionStrong" className="text-primaryDark">
              Sahip
            </AppText>

            <AppText className="mt-1 text-textDark">Galeri sahibi</AppText>
          </View>

          {partner ? (
            <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
              <AppText variant="captionStrong" className="text-primaryDark">
                Partner
              </AppText>

              <AppText className="mt-1 text-textDark">
                Aktif galeri ortağı
              </AppText>

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
              <AppText variant="captionStrong" className="text-primaryDark">
                Partner
              </AppText>

              <AppText className="mt-1 text-textMuted">
                Henüz galeri ortağı yok.
              </AppText>
            </View>
          )}

          {isPartner ? (
            <AppButton
              title="Galeriden Ayrıl"
              variant="ghost"
              loading={leaving}
              onPress={handleLeaveGallery}
            />
          ) : null}
        </View>
      </AppCard>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title="Galeri Hesabı Yönetimi"
        description="Galeri ortağını ve erişim isteklerini yönetin."
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
              {renderSummaryCard()}

              {ownerInvitations.length > 1 || partnerInvitations.length > 1 ? (
                <AppCard className="mt-5">
                  <View className="gap-3">
                    <View>
                      <AppText variant="subtitle" className="text-textDark">
                        Galeri Seç
                      </AppText>

                      <AppText className="mt-1 text-textMuted">
                        Yönetmek istediğin galeriyi seç.
                      </AppText>
                    </View>

                    {[...ownerInvitations, ...partnerInvitations].map(
                      (invitation) => {
                        const isSelected =
                          invitation.id === selectedInvitationId;

                        return (
                          <AppButton
                            key={invitation.id}
                            title={`${formatGalleryTitle(invitation)} • ${getAccessRoleLabel(
                              invitation.access_role,
                            )}`}
                            variant={isSelected ? "primary" : "secondary"}
                            onPress={() =>
                              setSelectedInvitationId(invitation.id)
                            }
                          />
                        );
                      },
                    )}
                  </View>
                </AppCard>
              ) : null}

              {renderOwnerInviteCard()}
              {renderJoinGalleryCard()}
              {renderJoinRequestsCard()}
              {renderMembersCard()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
