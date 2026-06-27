import * as Clipboard from "expo-clipboard";
import { Share, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import type {
  GalleryAccessRole,
  GalleryPartner,
  GalleryPartnerRequest,
} from "@/types/invitation";

type Props = {
  accessRole: GalleryAccessRole;
  inviteCode?: string | null;
  partner?: GalleryPartner | null;
  pendingRequests?: GalleryPartnerRequest[];
  refreshingCode?: boolean;
  approvingRequestId?: string | null;
  rejectingRequestId?: string | null;
  removingPartner?: boolean;
  leavingGallery?: boolean;
  onRefreshCode?: () => void;
  onApproveRequest?: (request: GalleryPartnerRequest) => void;
  onRejectRequest?: (request: GalleryPartnerRequest) => void;
  onRemovePartner?: (partner: GalleryPartner) => void;
  onLeaveGallery?: () => void;
};

export function GalleryPartnerAccessCard({
  accessRole,
  inviteCode,
  partner,
  pendingRequests = [],
  refreshingCode = false,
  approvingRequestId,
  rejectingRequestId,
  removingPartner = false,
  leavingGallery = false,
  onRefreshCode,
  onApproveRequest,
  onRejectRequest,
  onRemovePartner,
  onLeaveGallery,
}: Props) {
  const isOwner = accessRole === "owner";
  const hasPartner = Boolean(partner);

  async function handleCopyCode() {
    if (!inviteCode || hasPartner) return;
    await Clipboard.setStringAsync(inviteCode);
  }

  async function handleShareCode() {
    if (!inviteCode || hasPartner) return;

    await Share.share({
      message: `Weddion galeri ortağı olmak için kodum: ${inviteCode}`,
    });
  }

  if (!isOwner) {
    return (
      <AppCard className="mt-5">
        <View className="gap-3">
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Galeri Ortağı
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Bu galeriye partner olarak erişiyorsun. Fotoğrafları görebilir,
              indirebilir ve silebilirsin. Davetiyeyi düzenleyemezsin.
            </AppText>
          </View>

          <AppButton
            title="Galeriden Çık"
            variant="ghost"
            loading={leavingGallery}
            onPress={onLeaveGallery}
          />
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard className="mt-5">
      <View className="gap-4">
        <View>
          <AppText variant="subtitle" className="text-textDark">
            Galeri Ortağı
          </AppText>

          <AppText className="mt-1 text-textMuted">
            Galeriye sadece sen ve onayladığın tek partner erişebilir. Partner
            fotoğrafları görebilir, indirebilir ve silebilir; davetiyeyi
            düzenleyemez.
          </AppText>
        </View>

        {hasPartner && partner ? (
          <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
            <AppText variant="captionStrong" className="text-primaryDark">
              Aktif Partner
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Bu galeride şu anda bir partner var. Yeni partner eklemek için
              önce mevcut partneri kaldırmalısın.
            </AppText>

            <AppButton
              title="Partneri Kaldır"
              variant="ghost"
              className="mt-3"
              loading={removingPartner}
              onPress={() => onRemovePartner?.(partner)}
            />
          </View>
        ) : (
          <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
            <AppText variant="captionStrong" className="text-primaryDark">
              Galeri Ortak Kodu
            </AppText>

            <AppText variant="title" className="mt-1 text-textDark">
              {inviteCode ?? "Kod yok"}
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Bu kodu partnerinle paylaş. Kodla istek gönderdiğinde buradan
              onaylayabilirsin.
            </AppText>

            <View className="mt-3 flex-row gap-2">
              <View className="flex-1">
                <AppButton
                  title="Kopyala"
                  variant="secondary"
                  disabled={!inviteCode}
                  onPress={handleCopyCode}
                />
              </View>

              <View className="flex-1">
                <AppButton
                  title="Paylaş"
                  variant="secondary"
                  disabled={!inviteCode}
                  onPress={handleShareCode}
                />
              </View>
            </View>

            <AppButton
              title="Kodu Yenile"
              variant="ghost"
              className="mt-2"
              loading={refreshingCode}
              onPress={onRefreshCode}
            />
          </View>
        )}

        {!hasPartner && pendingRequests.length > 0 ? (
          <View className="gap-3">
            <AppText variant="captionStrong" className="text-primaryDark">
              Bekleyen İstekler
            </AppText>

            {pendingRequests.map((request) => {
              const requesterName =
                request.requesterDisplayName?.trim() || "Bir kullanıcı";

              return (
                <View
                  key={request.id}
                  className="rounded-2xl border border-border bg-white p-4"
                >
                  <AppText variant="captionStrong" className="text-textDark">
                    {requesterName}
                  </AppText>

                  <AppText className="mt-1 text-textMuted">
                    Galeriye partner olarak erişmek istiyor.
                  </AppText>

                  <View className="mt-3 flex-row gap-2">
                    <View className="flex-1">
                      <AppButton
                        title="Reddet"
                        variant="ghost"
                        loading={rejectingRequestId === request.id}
                        onPress={() => onRejectRequest?.(request)}
                      />
                    </View>

                    <View className="flex-1">
                      <AppButton
                        title="Onayla"
                        loading={approvingRequestId === request.id}
                        onPress={() => onApproveRequest?.(request)}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
