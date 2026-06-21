import { ImageBackground, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
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

function getDisplayValue(value: string | null | undefined, fallback: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : fallback;
}

export function InvitationPreviewCard({ imageUrl, formData }: Props) {
  const brideName = getDisplayValue(
    formData.brideName,
    defaultInvitationContent.brideName,
  );

  const groomName = getDisplayValue(
    formData.groomName,
    defaultInvitationContent.groomName,
  );

  const brideParents = getDisplayValue(
    formData.brideParents,
    defaultInvitationContent.brideParents,
  );

  const groomParents = getDisplayValue(
    formData.groomParents,
    defaultInvitationContent.groomParents,
  );

  const brideSurname = getDisplayValue(
    formData.brideSurname,
    defaultInvitationContent.brideSurname,
  );

  const groomSurname = getDisplayValue(
    formData.groomSurname,
    defaultInvitationContent.groomSurname,
  );

  const date = getDisplayValue(formData.date, defaultInvitationContent.date);

  const time = getDisplayValue(formData.time, defaultInvitationContent.time);

  const description = getDisplayValue(
    formData.description,
    defaultInvitationContent.description,
  );

  const venueName = getDisplayValue(
    formData.venueName,
    defaultInvitationContent.venueName,
  );

  const venueLocation = getDisplayValue(
    formData.venueLocation,
    defaultInvitationContent.venueLocation,
  );

  const content = (
    <View className="h-full w-full items-center justify-center px-7 py-10">
      <View className="w-full flex-1 items-center justify-center">
        <View className="items-center">
          <AppText variant="invitationNames" className="text-center">
            {brideName}
          </AppText>

          <AppText variant="invitationAmpersand" className="text-center">
            &
          </AppText>

          <AppText variant="invitationNames" className="text-center">
            {groomName}
          </AppText>
        </View>

        <View className="mt-7 w-full flex-row items-start justify-center gap-4 px-4">
          <View className="w-[130px] items-center">
            <AppText variant="invitationParents" className="text-center">
              {brideParents}
            </AppText>

            <AppText
              variant="invitationParents"
              className="mt-1 text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {brideSurname}
            </AppText>
          </View>

          <View className="w-[130px] items-center">
            <AppText variant="invitationParents" className="text-center">
              {groomParents}
            </AppText>

            <AppText
              variant="invitationParents"
              className="mt-1 text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {groomSurname}
            </AppText>
          </View>
        </View>

        <View className="mt-7 w-full flex-row items-center justify-center gap-3">
          <AppText variant="invitationMeta" className="text-center">
            {formatInvitationDate(date)}
          </AppText>

          {!!date && !!time && <View className="h-4 w-px bg-border" />}

          <AppText variant="invitationMeta" className="text-center">
            {time}
          </AppText>
        </View>

        <AppText
          variant="invitationBody"
          className="mt-5 max-w-[230px] text-center"
          numberOfLines={4}
        >
          {description}
        </AppText>

        <AppText variant="invitationVenue" className="mt-6 text-center">
          {venueName}
        </AppText>

        <AppText
          variant="invitationLocation"
          className="mt-2 max-w-[220px] text-center"
          numberOfLines={2}
        >
          {venueLocation}
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
