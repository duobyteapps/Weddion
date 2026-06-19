import { ImageBackground, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { InvitationFormData } from "@/types/invitation";

type Props = {
  imageUrl?: string | null;
  formData: InvitationFormData;
};

function formatInvitationDate(value: string) {
  if (!value) {
    return "";
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDateRegex.test(value)) {
    return value;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InvitationPreviewCard({ imageUrl, formData }: Props) {
  const content = (
    <View className="h-full w-full items-center justify-center px-7 py-10">
      <View className="w-full flex-1 items-center justify-center">
        <View className="items-center">
          <AppText variant="invitationNames" className="text-center">
            {formData.brideName}
          </AppText>

          <AppText variant="invitationAmpersand" className="-my-1 text-center">
            &
          </AppText>

          <AppText variant="invitationNames" className="text-center">
            {formData.groomName}
          </AppText>
        </View>

        <View className="mt-7 w-full flex-row items-start justify-center gap-16">
          <View className="min-w-[90px] flex-1 items-center">
            <AppText variant="invitationParents" className="text-center">
              Anne & Baba
            </AppText>

            <AppText
              variant="invitationParents"
              className="mt-1 text-center text-textDark"
              numberOfLines={2}
            >
              {formData.brideParents}
            </AppText>
          </View>

          <View className="min-w-[90px] flex-1 items-center">
            <AppText variant="invitationParents" className="text-center">
              Anne & Baba
            </AppText>

            <AppText
              variant="invitationParents"
              className="mt-1 text-center text-textDark"
              numberOfLines={2}
            >
              {formData.groomParents}
            </AppText>
          </View>
        </View>

        <View className="mt-7 w-full flex-row items-center justify-center gap-3">
          <AppText variant="invitationMeta" className="text-center">
            {formatInvitationDate(formData.date)}
          </AppText>

          {!!formData.date && !!formData.time && (
            <View className="h-4 w-px bg-border" />
          )}

          <AppText variant="invitationMeta" className="text-center">
            {formData.time}
          </AppText>
        </View>

        <AppText
          variant="invitationBody"
          className="mt-5 max-w-[230px] text-center"
          numberOfLines={4}
        >
          {formData.description}
        </AppText>

        <AppText variant="invitationVenue" className="mt-6 text-center">
          {formData.venueName}
        </AppText>

        <AppText
          variant="invitationLocation"
          className="mt-2 max-w-[220px] text-center"
          numberOfLines={2}
        >
          {formData.venueLocation}
        </AppText>
      </View>
    </View>
  );

  return (
    <AppCard noPadding className="overflow-hidden py-1 !px-1">
      <View className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-card">
        {imageUrl ? (
          <ImageBackground
            source={{ uri: imageUrl }}
            resizeMode="cover"
            className="h-full w-full"
          >
            {content}
          </ImageBackground>
        ) : (
          content
        )}
      </View>
    </AppCard>
  );
}
