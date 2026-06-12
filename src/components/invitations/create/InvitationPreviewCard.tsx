import { ImageBackground, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  imageUrl?: string | null;
  names: string;
  date: string;
  time: string;
  description: string;
  venueName: string;
  venueLocation: string;
};

export function InvitationPreviewCard({
  imageUrl,
  names,
  date,
  time,
  description,
  venueName,
  venueLocation,
}: Props) {
  const nameParts = names
    .split("&")
    .map((item) => item.trim())
    .filter(Boolean);

  const firstName = nameParts[0] ?? "";
  const secondName = nameParts[1] ?? "";

  const hasFirstName = firstName.length > 0;
  const hasSecondName = secondName.length > 0;
  const hasNames = hasFirstName || hasSecondName;

  const hasDate = date.trim().length > 0;
  const hasTime = time.trim().length > 0;
  const hasDescription = description.trim().length > 0;
  const hasVenueName = venueName.trim().length > 0;
  const hasVenueLocation = venueLocation.trim().length > 0;

  const content = (
    <View className="min-h-[520px] items-center justify-center px-5 py-8">
      {hasNames ? (
        <>
          {hasFirstName ? (
            <AppText
              variant="serifTitle"
              className="mt-8 text-center text-[52px] leading-[58px] text-textDark"
            >
              {firstName}
            </AppText>
          ) : null}

          {hasFirstName && hasSecondName ? (
            <AppText
              variant="serifTitle"
              className="mt-2 text-center text-[38px] leading-[42px] text-primaryDark"
            >
              &
            </AppText>
          ) : null}

          {hasSecondName ? (
            <AppText
              variant="serifTitle"
              className="mt-2 text-center text-[52px] leading-[58px] text-textDark"
            >
              {secondName}
            </AppText>
          ) : null}
        </>
      ) : null}

      {hasDate ? (
        <AppText
          variant="subtitle"
          className="mt-9 text-center text-[17px] text-primaryDark"
        >
          {date}
        </AppText>
      ) : null}

      {hasTime ? (
        <AppText
          variant="captionStrong"
          className="mt-2 text-center text-textDark"
        >
          {time}
        </AppText>
      ) : null}

      {hasDescription ? (
        <>
          <View className="my-7 h-[1px] w-28 bg-border" />

          <AppText variant="body" className="text-center text-textDark">
            {description}
          </AppText>
        </>
      ) : null}

      {hasVenueName ? (
        <AppText
          variant="captionStrong"
          className="mt-9 text-center text-primaryDark"
        >
          {venueName}
        </AppText>
      ) : null}

      {hasVenueLocation ? (
        <AppText variant="caption" className="mt-1 text-center text-textDark">
          {venueLocation}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <AppCard className="overflow-hidden rounded-[28px] bg-surface px-5 py-7">
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          resizeMode="cover"
          imageClassName="rounded-[24px]"
          className="min-h-[520px] overflow-hidden rounded-[24px]"
        >
          {content}
        </ImageBackground>
      ) : (
        <View className="min-h-[520px] overflow-hidden rounded-[24px] border border-borderSoft bg-surfaceLight">
          {content}
        </View>
      )}
    </AppCard>
  );
}
