import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  TextInput,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
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

    const isSharedGallery = hasPartner;
    const canUseInviteCode = isOwner && !isSharedGallery;

    const roleLabel = isSharedGallery ? "Ortak" : isOwner ? "Sahip" : "Ortak";

    const inviteCodeText = canUseInviteCode
      ? (selectedInvitation.gallery_partner_invite_code ?? "Kod yok")
      : "Zaten ortak galeri hesabındasın";

    return (
      <AppCard className="mt-5">
        <View className="mb-4 flex-row items-center">
          <AppIconBox
            icon="images-outline"
            color={Colors.primaryDark}
            size={22}
            className="mr-3 h-11 w-11 bg-primaryLight"
          />

          <View className="flex-1">
            <AppText variant="subtitle" className="text-textDark">
              Galerim
            </AppText>

            <AppText variant="body" className="mt-1">
              {activeMemberCount} kişi yönetiyor
            </AppText>
          </View>

          <View className="rounded-full bg-primaryLight px-3 py-1">
            <AppText variant="captionStrong">{roleLabel}</AppText>
          </View>
        </View>

        <View>
          <AppText variant="captionStrong" className="mb-2">
            Davet kodu
          </AppText>

          <View className="mb-3 flex-row items-center rounded-2xl border border-border bg-backgroundSoft px-4 py-3">
            <AppText
              variant="subtitle"
              numberOfLines={1}
              className={`flex-1 ${
                canUseInviteCode
                  ? "text-[22px] tracking-[6px] text-textDark"
                  : "text-[16px] tracking-normal text-textMuted"
              }`}
            >
              {inviteCodeText}
            </AppText>

            <Pressable
              disabled={!canUseInviteCode}
              onPress={canUseInviteCode ? handleCopyInviteCode : undefined}
            >
              <AppIconBox
                icon="copy-outline"
                color={Colors.primaryDark}
                className={`h-9 w-9 rounded-full bg-white ${
                  canUseInviteCode ? "" : "opacity-40"
                }`}
              />
            </Pressable>
          </View>

          {isOwner ? (
            <View className="gap-3">
              <AppButton
                title="Davet Kodunu Paylaş"
                disabled={!canUseInviteCode}
                onPress={handleShareInviteCode}
              />

              <AppButton
                title="Davet Kodunu Yenile"
                variant="ghost"
                disabled={!canUseInviteCode}
                loading={refreshingCode}
                onPress={handleRefreshInviteCode}
              />
            </View>
          ) : null}
        </View>

        {isPartner ? (
          <AppButton
            title="Bu Galeriden Ayrıl"
            variant="ghost"
            loading={leaving}
            className="mt-4"
            onPress={handleLeaveGallery}
          />
        ) : null}
      </AppCard>
    );
  }

  const OWNER_COLOR = "#8FAF8B";
  const MEMBER_COLOR = "#C9B37E";

  function renderMembersCard() {
    if (!selectedInvitation) {
      return null;
    }

    const members = [
      {
        id: "owner",
        role: "owner",
        title: "Hesap Sahibi",
        displayName: "Galeri sahibi",
      },
      ...(partner
        ? [
            {
              id: "partner",
              role: "partner",
              title: "Galeri Ortağı",
              displayName: "Aktif galeri ortağı",
            },
          ]
        : []),
    ];

    return (
      <AppCard className="mt-5">
        <AppText variant="subtitle" className="mb-4 text-textDark">
          Galeri Ortakları
        </AppText>

        {members.map((member, index) => {
          const memberIsOwner = member.role === "owner";
          const memberIsPartner = member.role === "partner";
          const isLast = index === members.length - 1;
          const roleColor = memberIsOwner ? OWNER_COLOR : MEMBER_COLOR;

          return (
            <View
              key={member.id}
              className={`flex-row items-center ${
                isLast ? "pb-0" : "border-b border-borderSoft pb-3"
              } ${index === 0 ? "" : "pt-3"}`}
            >
              <AppIconBox
                icon={memberIsOwner ? "person" : "people-outline"}
                size={19}
                className="mr-3 h-10 w-10 bg-primaryLight"
              />

              <View className="flex-1">
                <AppText variant="captionStrong">{member.title}</AppText>

                <AppText variant="caption" className="mt-1">
                  {member.displayName}
                </AppText>
              </View>

              <View className="items-end">
                {memberIsOwner ? (
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${roleColor}18` }}
                  >
                    <AppText
                      variant="captionStrong"
                      style={{ color: roleColor }}
                    >
                      Sahip
                    </AppText>
                  </View>
                ) : null}

                {isOwner && memberIsPartner ? (
                  <Pressable
                    onPress={handleRemovePartner}
                    disabled={removingPartner}
                    className="rounded-full bg-white px-3 py-2"
                  >
                    <AppText variant="captionStrong" className="text-error">
                      {removingPartner ? "Çıkarılıyor..." : "Çıkar"}
                    </AppText>
                  </Pressable>
                ) : null}

                {!isOwner && memberIsPartner ? (
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${roleColor}18` }}
                  >
                    <AppText
                      variant="captionStrong"
                      style={{ color: roleColor }}
                    >
                      Ortak
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </AppCard>
    );
  }

  function renderJoinRequestsCard() {
    if (!isOwner || hasPartner || joinRequests.length === 0) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <AppText variant="title" className="mb-5 text-textDark">
          Bekleyen Katılma İstekleri
        </AppText>

        {joinRequests.map((request, index) => {
          const requesterName =
            request.requesterDisplayName?.trim() || "Bir kullanıcı";

          const isLast = index === joinRequests.length - 1;

          return (
            <View
              key={request.id}
              className={`${isLast ? "" : "mb-5 border-b border-border pb-5"}`}
            >
              <View className="mb-4 flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Ionicons
                    name="person-add-outline"
                    size={22}
                    color={Colors.primary}
                  />
                </View>

                <View className="flex-1">
                  <AppText variant="captionStrong" className="text-primary">
                    {requesterName}
                  </AppText>

                  <AppText className="mt-1 text-textMuted">
                    Galeriye ortak olarak erişmek istiyor.
                  </AppText>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <AppButton
                    title="Reddet"
                    variant="ghost"
                    loading={rejectingRequestId === request.id}
                    disabled={
                      approvingRequestId === request.id ||
                      rejectingRequestId === request.id
                    }
                    onPress={() => handleRejectJoinRequest(request)}
                  />
                </View>

                <View className="flex-1">
                  <AppButton
                    title="Onayla"
                    loading={approvingRequestId === request.id}
                    disabled={
                      approvingRequestId === request.id ||
                      rejectingRequestId === request.id
                    }
                    onPress={() => handleApproveJoinRequest(request)}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </AppCard>
    );
  }

  function renderJoinCard() {
    if (!shouldShowJoinCard) {
      return null;
    }

    const disabled = hasPartner || isPartner;
    const inputValue = disabled ? "Zaten ortak galeri hesabındasın" : joinCode;

    return (
      <AppCard className="mt-5">
        <AppText variant="subtitle" className="mb-2 text-textDark">
          Davet Kodu ile Katıl
        </AppText>

        <AppText variant="body" className="mb-4">
          Sana verilen davet kodunu girerek aynı galeriye katılabilirsin.
        </AppText>

        <TextInput
          value={inputValue}
          editable={!disabled}
          pointerEvents={disabled ? "none" : "auto"}
          onChangeText={(value) => {
            if (!disabled) {
              setJoinCode(value.toUpperCase());
            }
          }}
          placeholder="Davet kodu"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          className={`mb-3 rounded-2xl border border-border bg-white px-4 py-3 font-manropeSemiBold text-[16px] text-textDark ${
            disabled ? "tracking-normal opacity-60" : "tracking-[4px]"
          }`}
        />

        <AppButton
          title="Galeri Hesabına Katıl"
          loading={joining}
          disabled={disabled}
          onPress={handleJoinGallery}
        />
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
              <ActivityIndicator color={Colors.primary} />

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
