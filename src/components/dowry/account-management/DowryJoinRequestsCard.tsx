import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { DowryJoinRequest } from "@/types/dowry";

type Props = {
  requests: DowryJoinRequest[];
  approvingRequestId: string | null;
  rejectingRequestId: string | null;
  onApprove: (request: DowryJoinRequest) => void;
  onReject: (request: DowryJoinRequest) => void;
};

export function DowryJoinRequestsCard({
  requests,
  approvingRequestId,
  rejectingRequestId,
  onApprove,
  onReject,
}: Props) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <AppCard>
      <View className="mb-4 flex-row items-center">
        <AppIconBox
          icon="person-add-outline"
          color={Colors.primaryDark}
          className="mr-3 h-10 w-10 bg-primaryLight"
        />

        <View className="flex-1">
          <AppText variant="subtitle" className="text-textDark">
            Katılma İstekleri
          </AppText>

          <AppText variant="caption" className="mt-1">
            Çeyiz hesabına katılmak isteyen kişileri onaylayın.
          </AppText>
        </View>
      </View>

      {requests.map((request, index) => {
        const isLast = index === requests.length - 1;
        const isApproving = approvingRequestId === request.id;
        const isRejecting = rejectingRequestId === request.id;
        const isBusy = isApproving || isRejecting;

        return (
          <View
            key={request.id}
            className={`${isLast ? "pb-0" : "border-b border-borderSoft pb-4"} ${
              index === 0 ? "" : "pt-4"
            }`}
          >
            <View className="mb-3 flex-row items-center">
              <AppIconBox
                icon="person-outline"
                color={Colors.primaryDark}
                className="mr-3 h-9 w-9 rounded-full bg-backgroundSoft"
              />

              <View className="flex-1">
                <AppText variant="captionStrong" className="text-textDark">
                  {request.requesterDisplayName ?? "İsim bilgisi yok"}
                </AppText>

                <AppText variant="caption" className="mt-1">
                  Ortak çeyiz hesabına katılmak istiyor.
                </AppText>
              </View>
            </View>

            <View className="gap-2">
              <AppButton
                title="Onayla"
                loading={isApproving}
                disabled={isBusy && !isApproving}
                onPress={() => onApprove(request)}
              />

              <AppButton
                title="Reddet"
                variant="ghost"
                loading={isRejecting}
                disabled={isBusy && !isRejecting}
                onPress={() => onReject(request)}
              />
            </View>
          </View>
        );
      })}
    </AppCard>
  );
}
