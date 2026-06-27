import { Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import type { GalleryAccessibleInvitation } from "@/types/galleryPartner";

type Props = {
  selectedInvitation: GalleryAccessibleInvitation | null;
  hasPartner: boolean;
  isOwner: boolean;
  isPartner: boolean;
  activeMemberCount: number;
  canUseInviteActions: boolean;
  refreshingCode: boolean;
  leaving: boolean;
  onCopyInviteCode: () => void;
  onShareInviteCode: () => void;
  onRefreshInviteCode: () => void;
  onLeaveGallery: () => void;
};

export function GalleryAccountSummaryCard({
  selectedInvitation,
  hasPartner,
  isOwner,
  isPartner,
  activeMemberCount,
  canUseInviteActions,
  refreshingCode,
  leaving,
  onCopyInviteCode,
  onShareInviteCode,
  onRefreshInviteCode,
  onLeaveGallery,
}: Props) {
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
    <AppCard>
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

        {isOwner ? (
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
        ) : null}
      </View>

      {isPartner ? (
        <AppButton
          title="Bu Galeriden Ayrıl"
          variant="ghost"
          loading={leaving}
          className="mt-4"
          onPress={onLeaveGallery}
        />
      ) : null}
    </AppCard>
  );
}
