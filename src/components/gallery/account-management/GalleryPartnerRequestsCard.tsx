import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
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
    <AppCard>
      {joinRequests.map((request, index) => {
        const isLast = index === joinRequests.length - 1;
        const isApproving = approvingRequestId === request.id;
        const isRejecting = rejectingRequestId === request.id;
        const isBusy = isApproving || isRejecting;

        const requesterName =
          request.requesterDisplayName?.trim() || "İsim bilgisi yok";

        return (
          <View
            key={request.id}
            className={`${isLast ? "pb-0" : "border-b border-borderSoft pb-4"} ${
              index === 0 ? "" : "pt-4"
            }`}
          >
            <View className="mb-3 flex-row items-center">
              <AppIconBox
                icon="person-add-outline"
                color={Colors.primaryDark}
                className="mr-3 h-10 w-10 bg-primaryLight"
              />

              <View className="flex-1">
                <AppText variant="subtitle" className="text-textDark">
                  {requesterName}
                </AppText>

                <AppText variant="caption" className="mt-1">
                  Galeriye ortak olarak erişmek istiyor.
                </AppText>
              </View>
            </View>

            <View className="gap-2">
              <AppButton
                title="Onayla"
                loading={isApproving}
                disabled={isBusy && !isApproving}
                onPress={() => onApproveJoinRequest(request)}
              />

              <AppButton
                title="Reddet"
                variant="ghost"
                loading={isRejecting}
                disabled={isBusy && !isRejecting}
                onPress={() => onRejectJoinRequest(request)}
              />
            </View>
          </View>
        );
      })}
    </AppCard>
  );
}
