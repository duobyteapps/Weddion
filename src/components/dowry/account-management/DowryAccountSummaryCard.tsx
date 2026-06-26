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
  const canShowInviteCode = isOwner && !isSharedAccount;
  const roleLabel = isSharedAccount ? "Ortak" : isOwner ? "Sahip" : "Ortak";

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

      {canShowInviteCode ? (
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

            <Pressable onPress={onCopyInviteCode}>
              <AppIconBox
                icon="copy-outline"
                color={Colors.primaryDark}
                className="h-9 w-9 rounded-full bg-white"
              />
            </Pressable>
          </View>

          <View className="mb-4 gap-3">
            <AppButton
              title="Davet Kodunu Paylaş"
              onPress={onShareInviteCode}
            />

            <AppButton
              title="Davet Kodunu Yenile"
              variant="ghost"
              loading={refreshingCode}
              onPress={onRefreshInviteCode}
            />
          </View>
        </View>
      ) : (
        <View>
          <AppText variant="body">
            Bu ortak çeyiz hesabını birlikte yönetiyorsunuz. Ürünleri
            ekleyebilir, düzenleyebilir ve tamamlandı yapabilirsiniz.
          </AppText>

          {!isOwner ? (
            <AppButton
              title="Bu Çeyiz Hesabından Ayrıl"
              variant="ghost"
              loading={leaving}
              className="mt-4"
              onPress={onLeaveAccount}
            />
          ) : null}
        </View>
      )}

      <View className="mt-4 rounded-2xl border border-border bg-backgroundSoft px-4 py-3">
        <View className="flex-row items-center">
          <AppIconBox
            icon="list-outline"
            color={Colors.primaryDark}
            className="mr-3 h-9 w-9 rounded-full bg-white"
          />

          <View className="flex-1">
            <AppText variant="captionStrong" className="text-textDark">
              Ortak çeyiz listesi
            </AppText>

            <AppText variant="caption" className="mt-1">
              Eklenen ürünler aynı hesapta birlikte görüntülenir.
            </AppText>
          </View>
        </View>

        <View className="mt-3 flex-row items-center border-t border-borderSoft pt-3">
          <AppIconBox
            icon="checkmark-done-outline"
            color={Colors.primaryDark}
            className="mr-3 h-9 w-9 rounded-full bg-white"
          />

          <View className="flex-1">
            <AppText variant="captionStrong" className="text-textDark">
              Birlikte yönetim
            </AppText>

            <AppText variant="caption" className="mt-1">
              Tamamlandı, düzenleme ve silme işlemleri ortak çalışır.
            </AppText>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
