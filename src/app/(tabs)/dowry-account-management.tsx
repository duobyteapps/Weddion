import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";

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
              <AppCard>
                <View className="mb-4 flex-row items-center">
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primaryLight">
                    <Ionicons
                      name="heart-outline"
                      size={22}
                      color={Colors.primaryDark}
                    />
                  </View>

                  <View className="flex-1">
                    <AppText variant="subtitle" className="text-textDark">
                      {account?.title ?? "Çeyiz Listem"}
                    </AppText>
                    <AppText variant="body" className="mt-1">
                      {activeMemberCount} kişi yönetiyor
                    </AppText>
                  </View>

                  <View className="rounded-full bg-primaryLight px-3 py-1">
                    <AppText variant="captionStrong">
                      {isOwner ? "Sahip" : "Ortak"}
                    </AppText>
                  </View>
                </View>

                {isOwner ? (
                  <View>
                    <AppText variant="captionStrong" className="mb-2">
                      Davet kodu
                    </AppText>

                    <View className="mb-3 flex-row items-center rounded-2xl border border-border bg-backgroundSoft px-4 py-3">
                      <AppText
                        variant="subtitle"
                        className="flex-1 text-[22px] tracking-[6px] text-textDark"
                      >
                        {account?.inviteCode}
                      </AppText>

                      <Pressable
                        onPress={handleCopyInviteCode}
                        className="h-9 w-9 items-center justify-center rounded-full bg-white"
                      >
                        <Ionicons
                          name="copy-outline"
                          size={18}
                          color={Colors.primaryDark}
                        />
                      </Pressable>
                    </View>

                    <View className="gap-3">
                      <AppButton
                        title="Davet Kodunu Paylaş"
                        onPress={handleShareInviteCode}
                      />

                      <AppButton
                        title="Davet Kodunu Yenile"
                        variant="ghost"
                        loading={refreshingCode}
                        onPress={handleRefreshInviteCode}
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <AppText variant="body">
                      Bu ortak çeyiz hesabına üye olarak katıldın. Ürünleri
                      ekleyebilir, düzenleyebilir ve tamamlandı yapabilirsin.
                    </AppText>

                    <AppButton
                      title="Bu Çeyiz Hesabından Ayrıl"
                      variant="ghost"
                      loading={leaving}
                      className="mt-4"
                      onPress={handleLeaveAccount}
                    />
                  </View>
                )}
              </AppCard>

              <AppCard>
                <AppText variant="subtitle" className="mb-4 text-textDark">
                  Çeyiz Ortakları
                </AppText>

                {members.map((member, index) => {
                  const memberIsOwner = member.role === "owner";
                  const isLast = index === members.length - 1;

                  return (
                    <View
                      key={member.id}
                      className={`flex-row items-center ${
                        isLast ? "pb-0" : "border-b border-borderSoft pb-3"
                      } ${index === 0 ? "" : "pt-3"}`}
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primaryLight">
                        <Ionicons
                          name={memberIsOwner ? "person" : "people-outline"}
                          size={19}
                          color={Colors.primaryDark}
                        />
                      </View>

                      <View className="flex-1">
                        <AppText variant="captionStrong">
                          {memberIsOwner ? "Hesap Sahibi" : "Çeyiz Ortağı"}
                        </AppText>
                        <AppText variant="caption" className="mt-1">
                          {member.displayName ?? "İsim bilgisi yok"}
                        </AppText>
                      </View>

                      {isOwner && !memberIsOwner ? (
                        <Pressable
                          onPress={() => handleRemoveMember(member)}
                          className="rounded-full bg-white px-3 py-2"
                        >
                          <AppText
                            variant="captionStrong"
                            className="text-error"
                          >
                            Çıkar
                          </AppText>
                        </Pressable>
                      ) : (
                        <View className="rounded-full bg-primaryLight px-3 py-1">
                          <AppText variant="captionStrong">
                            {memberIsOwner ? "Sahip" : "Ortak"}
                          </AppText>
                        </View>
                      )}
                    </View>
                  );
                })}
              </AppCard>

              {canJoinAnotherDowryAccount ? (
                <AppCard>
                  <AppText variant="subtitle" className="mb-2 text-textDark">
                    Davet Kodu ile Katıl
                  </AppText>

                  <AppText variant="body" className="mb-4">
                    Nişanlının sana verdiği davet kodunu girerek aynı çeyiz
                    hesabına katılabilirsin.
                  </AppText>

                  <TextInput
                    value={inviteCode}
                    onChangeText={(value) => setInviteCode(value.toUpperCase())}
                    placeholder="Davet kodu"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    className="mb-3 rounded-2xl border border-border bg-white px-4 py-3 font-manropeSemiBold text-[16px] tracking-[4px] text-textDark"
                  />

                  <AppButton
                    title="Çeyiz Hesabına Katıl"
                    loading={joining}
                    onPress={handleJoinDowryAccount}
                  />
                </AppCard>
              ) : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
