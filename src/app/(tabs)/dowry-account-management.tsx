import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
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
import { DowryAccountMembersCard } from "@/components/dowry/account-management/DowryAccountMembersCard";
import { DowryAccountSummaryCard } from "@/components/dowry/account-management/DowryAccountSummaryCard";
import { DowryJoinAccountCard } from "@/components/dowry/account-management/DowryJoinAccountCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Colors } from "@/constants/Colors";
import {
  getDowryAccountMembers,
  getOrCreateMyDefaultDowryAccount,
  joinDowryAccountByCode,
  leaveDowryAccount,
  refreshDowryInviteCode,
  removeDowryAccountMember,
} from "@/services/dowryAccountService";
import { DowryAccount, DowryAccountMember } from "@/types/dowry";

export default function DowryAccountManagementScreen() {
  const { showAlert } = useAppAlert();

  const [account, setAccount] = useState<DowryAccount | null>(null);
  const [members, setMembers] = useState<DowryAccountMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshingCode, setRefreshingCode] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isOwner = account?.role === "owner";
  const activeMemberCount = account?.memberCount ?? members.length;
  const canJoinAnotherDowryAccount = isOwner && activeMemberCount <= 1;

  async function loadDowryAccount() {
    try {
      setLoading(true);

      const activeAccount = await getOrCreateMyDefaultDowryAccount();
      const activeMembers = await getDowryAccountMembers(activeAccount.id);

      setAccount(activeAccount);
      setMembers(activeMembers);
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

  useFocusEffect(
    useCallback(() => {
      loadDowryAccount();
    }, []),
  );

  async function handleCopyInviteCode() {
    if (!account?.inviteCode) return;

    await Clipboard.setStringAsync(account.inviteCode);

    showAlert({
      title: "Davet Kodu Kopyalandı",
      message: "Davet kodunu nişanlınla paylaşabilirsin.",
      type: "success",
    });
  }

  async function handleShareInviteCode() {
    if (!account?.inviteCode) return;

    await Share.share({
      message: `Weddion ortak çeyiz hesabına katılmak için davet kodum: ${account.inviteCode}`,
    });
  }

  async function handleRefreshInviteCode() {
    if (!account) return;

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

      const joinedAccount = await joinDowryAccountByCode(normalizedInviteCode);
      const activeMembers = await getDowryAccountMembers(joinedAccount.id);

      setAccount(joinedAccount);
      setMembers(activeMembers);
      setInviteCode("");

      showAlert({
        title: "Çeyiz Hesabına Katıldın",
        message: "Artık ortak çeyiz listesini birlikte yönetebilirsiniz.",
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Çeyiz hesabına katılırken bir hata oluştu.";

      showAlert({
        title: "Katılma Hatası",
        message,
        type: "error",
      });
    } finally {
      setJoining(false);
    }
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

          const activeMembers = await getDowryAccountMembers(account.id);
          setMembers(activeMembers);

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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-24"
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

              <DowryAccountMembersCard
                members={members}
                isOwner={isOwner}
                onRemoveMember={handleRemoveMember}
              />

              {canJoinAnotherDowryAccount ? (
                <DowryJoinAccountCard
                  inviteCode={inviteCode}
                  joining={joining}
                  onInviteCodeChange={setInviteCode}
                  onJoin={handleJoinDowryAccount}
                />
              ) : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
