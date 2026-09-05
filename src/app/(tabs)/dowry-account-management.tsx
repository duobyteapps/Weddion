import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Share, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { DowryAccountMembersCard } from "@/components/dowry/account-management/DowryAccountMembersCard";
import { DowryAccountSummaryCard } from "@/components/dowry/account-management/DowryAccountSummaryCard";
import { DowryJoinAccountCard } from "@/components/dowry/account-management/DowryJoinAccountCard";
import { DowryJoinRequestsCard } from "@/components/dowry/account-management/DowryJoinRequestsCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import AppKeyboardAvoidingView from "@/components/ui/AppKeyboardAvoidingView";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import {
  approveDowryAccountJoinRequest,
  getPendingDowryJoinRequests,
  rejectDowryAccountJoinRequest,
  requestDowryAccountJoinByCode,
} from "@/services/dowryAccountJoinRequestService";
import {
  getDowryAccountMembers,
  getOrCreateMyDefaultDowryAccount,
  leaveDowryAccount,
  refreshDowryInviteCode,
  removeDowryAccountMember,
} from "@/services/dowryAccountService";
import {
  DowryAccount,
  DowryAccountMember,
  DowryJoinRequest,
} from "@/types/dowry";

export default function DowryAccountManagementScreen() {
  const { showAlert } = useAppAlert();

  const [account, setAccount] = useState<DowryAccount | null>(null);
  const [members, setMembers] = useState<DowryAccountMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<DowryJoinRequest[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshingCode, setRefreshingCode] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  );
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null,
  );

  const isOwner = account?.role === "owner";
  const activeMemberCount = members.length;
  const isSharedAccount = activeMemberCount > 1;
  const canUseInviteActions = Boolean(isOwner && !isSharedAccount);
  const isJoinAccountDisabled = !canUseInviteActions;

  async function loadJoinRequests(dowryAccount: DowryAccount | null) {
    if (!dowryAccount || dowryAccount.role !== "owner") {
      setJoinRequests([]);
      return;
    }

    const pendingRequests = await getPendingDowryJoinRequests(dowryAccount.id);

    setJoinRequests(pendingRequests);
  }

  async function loadDowryAccount() {
    try {
      setLoading(true);

      const activeAccount = await getOrCreateMyDefaultDowryAccount();
      const activeMembers = await getDowryAccountMembers(activeAccount.id);

      setAccount(activeAccount);
      setMembers(activeMembers);

      await loadJoinRequests(activeAccount);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Çeyiz hesabı bilgileri alınırken bir hata oluştu.";

      showAlert({
        title: "Çeyiz Hesabı Hatası",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function refreshDowryAccountSilently() {
    if (!account) {
      await loadDowryAccount();
      return;
    }

    const activeMembers = await getDowryAccountMembers(account.id);

    setMembers(activeMembers);

    await loadJoinRequests(account);
  }

  useFocusEffect(
    useCallback(() => {
      loadDowryAccount();
    }, []),
  );

  async function handleCopyInviteCode() {
    if (!account?.inviteCode || !canUseInviteActions) return;

    await Clipboard.setStringAsync(account.inviteCode);

    showAlert({
      title: "Davet Kodu Kopyalandı",
      message: "Davet kodunu nişanlınla paylaşabilirsin.",
      type: "success",
    });
  }

  async function handleShareInviteCode() {
    if (!account?.inviteCode || !canUseInviteActions) return;

    await Share.share({
      message: `Weddion ortak çeyiz hesabına katılmak için davet kodum: ${account.inviteCode}`,
    });
  }

  async function handleRefreshInviteCode() {
    if (!account || !canUseInviteActions) return;

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

          const updatedAccount = await refreshDowryInviteCode(account.id);
          const activeMembers = await getDowryAccountMembers(updatedAccount.id);

          setAccount(updatedAccount);
          setMembers(activeMembers);

          await loadJoinRequests(updatedAccount);

          showAlert({
            title: "Davet Kodu Yenilendi",
            message: "Yeni davet kodunu nişanlınla paylaşabilirsin.",
            type: "success",
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Davet kodu yenilenirken bir hata oluştu.";

          showAlert({
            title: "Davet Kodu Hatası",
            message,
            type: "error",
          });
        } finally {
          setRefreshingCode(false);
        }
      },
    });
  }

  async function handleJoinDowryAccount() {
    if (isJoinAccountDisabled) return;

    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    if (normalizedInviteCode.length < 4) {
      showAlert({
        title: "Davet Kodu Eksik",
        message: "Lütfen geçerli bir davet kodu girin.",
        type: "warning",
      });
      return;
    }

    try {
      setJoining(true);

      await requestDowryAccountJoinByCode(normalizedInviteCode);

      setInviteCode("");

      showAlert({
        title: "Katılma İsteği Gönderildi",
        message:
          "Hesap sahibi isteğini onayladığında ortak çeyiz hesabına katılacaksın.",
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Katılma isteği gönderilirken bir hata oluştu.";

      showAlert({
        title: "Katılma İsteği Hatası",
        message,
        type: "error",
      });
    } finally {
      setJoining(false);
    }
  }

  function handleApproveJoinRequest(request: DowryJoinRequest) {
    showAlert({
      title: "Katılma İsteği Onaylansın mı?",
      message:
        "Bu kişi ortak çeyiz hesabındaki ürünleri görebilecek ve yönetebilecek.",
      type: "warning",
      confirmText: "Onayla",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setApprovingRequestId(request.id);

          await approveDowryAccountJoinRequest(request.id);
          await refreshDowryAccountSilently();

          showAlert({
            title: "Katılma İsteği Onaylandı",
            message: "Kişi ortak çeyiz hesabına eklendi.",
            type: "success",
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Katılma isteği onaylanırken bir hata oluştu.";

          showAlert({
            title: "Onaylama Hatası",
            message,
            type: "error",
          });
        } finally {
          setApprovingRequestId(null);
        }
      },
    });
  }

  function handleRejectJoinRequest(request: DowryJoinRequest) {
    showAlert({
      title: "Katılma İsteği Reddedilsin mi?",
      message: "Bu kişi ortak çeyiz hesabına eklenmeyecek.",
      type: "warning",
      confirmText: "Reddet",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setRejectingRequestId(request.id);

          await rejectDowryAccountJoinRequest(request.id);
          await refreshDowryAccountSilently();

          showAlert({
            title: "Katılma İsteği Reddedildi",
            message: "Kişi ortak çeyiz hesabına eklenmedi.",
            type: "success",
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Katılma isteği reddedilirken bir hata oluştu.";

          showAlert({
            title: "Reddetme Hatası",
            message,
            type: "error",
          });
        } finally {
          setRejectingRequestId(null);
        }
      },
    });
  }

  function handleRemoveMember(member: DowryAccountMember) {
    if (!account) return;

    showAlert({
      title: "Ortak Çıkarılsın mı?",
      message:
        "Bu kişi artık ortak çeyiz hesabındaki ürünleri göremez ve yönetemez.",
      type: "warning",
      confirmText: "Çıkar",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          await removeDowryAccountMember({
            dowryAccountId: account.id,
            memberUserId: member.userId,
          });

          await refreshDowryAccountSilently();

          showAlert({
            title: "Ortak Çıkarıldı",
            message: "Kişinin ortak çeyiz hesabı erişimi kaldırıldı.",
            type: "success",
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Ortak çıkarılırken bir hata oluştu.";

          showAlert({
            title: "Ortak Çıkarma Hatası",
            message,
            type: "error",
          });
        }
      },
    });
  }

  function handleLeaveAccount() {
    if (!account) return;

    showAlert({
      title: "Çeyiz Hesabından Ayrıl?",
      message:
        "Bu ortak çeyiz hesabından ayrılırsan listedeki ürünleri artık göremezsin.",
      type: "warning",
      confirmText: "Ayrıl",
      cancelText: "İptal",
      onConfirm: async () => {
        try {
          setLeaving(true);

          await leaveDowryAccount(account.id);
          await loadDowryAccount();

          showAlert({
            title: "Çeyiz Hesabından Ayrıldın",
            message: "Yeni kişisel çeyiz hesabın hazırlandı.",
            type: "success",
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Çeyiz hesabından ayrılırken bir hata oluştu.";

          showAlert({
            title: "Ayrılma Hatası",
            message,
            type: "error",
          });
        } finally {
          setLeaving(false);
        }
      },
    });
  }

  return (
    <ScreenContainer>
      <AppKeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-10"
        >
          <ScreenHeader
            title="Çeyiz Hesabı Yönetimi"
            description="Ortak çeyiz listenizi birlikte yönetin."
            backTo="/(tabs)/profile"
          />

          {loading ? (
            <View className="mt-16 items-center justify-center">
              <ActivityIndicator color={Colors.primary} />

              <AppText variant="body" className="mt-3">
                Çeyiz hesabı hazırlanıyor...
              </AppText>
            </View>
          ) : (
            <View>
              <DowryAccountSummaryCard
                account={account}
                isOwner={isOwner}
                activeMemberCount={activeMemberCount}
                refreshingCode={refreshingCode}
                leaving={leaving}
                onCopyInviteCode={handleCopyInviteCode}
                onShareInviteCode={handleShareInviteCode}
                onRefreshInviteCode={handleRefreshInviteCode}
                onLeaveAccount={handleLeaveAccount}
              />

              <DowryJoinRequestsCard
                requests={joinRequests}
                approvingRequestId={approvingRequestId}
                rejectingRequestId={rejectingRequestId}
                onApprove={handleApproveJoinRequest}
                onReject={handleRejectJoinRequest}
              />

              <DowryAccountMembersCard
                members={members}
                isOwner={isOwner}
                onRemoveMember={handleRemoveMember}
              />

              <DowryJoinAccountCard
                inviteCode={inviteCode}
                joining={joining}
                disabled={isJoinAccountDisabled}
                onInviteCodeChange={setInviteCode}
                onJoin={handleJoinDowryAccount}
              />
            </View>
          )}
        </ScrollView>
      </AppKeyboardAvoidingView>
    </ScreenContainer>
  );
}
