import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import type { GalleryPartnerRequest } from "@/types/galleryPartner";

type Props = {
  isOwner: boolean;
  hasPartner: boolean;
  joinRequests: GalleryPartnerRequest[];
  approvingRequestId: string | null;
  rejectingRequestId: string | null;
  onApproveJoinRequest: (request: GalleryPartnerRequest) => void;
  onRejectJoinRequest: (request: GalleryPartnerRequest) => void;
};

export function GalleryPartnerRequestsCard({
  isOwner,
  hasPartner,
  joinRequests,
  approvingRequestId,
  rejectingRequestId,
  onApproveJoinRequest,
  onRejectJoinRequest,
}: Props) {
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
                  onPress={() => onRejectJoinRequest(request)}
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
                  onPress={() => onApproveJoinRequest(request)}
                />
              </View>
            </View>
          </View>
        );
      })}
    </AppCard>
  );
}
