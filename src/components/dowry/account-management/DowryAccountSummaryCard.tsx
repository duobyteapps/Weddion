import { Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { DowryAccount } from "@/types/dowry";

type Props = {
  account: DowryAccount | null;
  isOwner: boolean;
  activeMemberCount: number;
  refreshingCode: boolean;
  leaving: boolean;
  onCopyInviteCode: () => void;
  onShareInviteCode: () => void;
  onRefreshInviteCode: () => void;
  onLeaveAccount: () => void;
};

export function DowryAccountSummaryCard({
  account,
  isOwner,
  activeMemberCount,
  refreshingCode,
  leaving,
  onCopyInviteCode,
  onShareInviteCode,
  onRefreshInviteCode,
  onLeaveAccount,
}: Props) {
  const isSharedAccount = activeMemberCount > 1;
  const canUseInviteCode = isOwner && !isSharedAccount;
  const roleLabel = isSharedAccount ? "Ortak" : isOwner ? "Sahip" : "Ortak";
  const inviteCodeText = canUseInviteCode
    ? account?.inviteCode
    : "Zaten ortak çeyiz hesabındasın";

  return (
    <AppCard>
      <View className="mb-4 flex-row items-center">
        <AppIconBox
          icon="gift"
          color={Colors.primaryDark}
          size={22}
          className="mr-3 h-11 w-11 bg-primaryLight"
        />

        <View className="flex-1">
          <AppText variant="subtitle" className="text-textDark">
            {account?.title ?? "Çeyiz Listem"}
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
            onPress={canUseInviteCode ? onCopyInviteCode : undefined}
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

        <View className="gap-3">
          <AppButton
            title="Davet Kodunu Paylaş"
            disabled={!canUseInviteCode}
            onPress={onShareInviteCode}
          />

          <AppButton
            title="Davet Kodunu Yenile"
            variant="ghost"
            disabled={!canUseInviteCode}
            loading={refreshingCode}
            onPress={onRefreshInviteCode}
          />
        </View>
      </View>

      {!isOwner ? (
        <AppButton
          title="Bu Çeyiz Hesabından Ayrıl"
          variant="ghost"
          loading={leaving}
          className="mt-4"
          onPress={onLeaveAccount}
        />
      ) : null}
    </AppCard>
  );
}
