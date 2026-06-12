import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

type Props = {
  names: string;
  date: string;
  time: string;
  description: string;
  venueName: string;
  venueLocation: string;
};

export function InvitationPreviewCard({
  names,
  date,
  time,
  description,
  venueName,
  venueLocation,
}: Props) {
  const [firstName = "Nisa", secondName = "Onur"] = names
    .split("&")
    .map((item) => item.trim());

  return (
    <AppCard className="overflow-hidden rounded-[28px] bg-surface px-5 py-7">
      <View className="min-h-[520px] items-center justify-center rounded-[24px] border border-borderSoft bg-surfaceLight px-5 py-8">
        <AppText
          variant="captionStrong"
          className="text-center tracking-[2px] text-textLight"
        >
          DAVETLİSİNİZ
        </AppText>

        <AppText
          variant="serifTitle"
          className="mt-8 text-center text-[52px] leading-[58px] text-textDark"
        >
          {firstName}
        </AppText>

        <AppText
          variant="serifTitle"
          className="mt-2 text-center text-[38px] leading-[42px] text-primaryDark"
        >
          &
        </AppText>

        <AppText
          variant="serifTitle"
          className="mt-2 text-center text-[52px] leading-[58px] text-textDark"
        >
          {secondName}
        </AppText>

        <AppText
          variant="subtitle"
          className="mt-9 text-center text-[17px] text-primaryDark"
        >
          {date}
        </AppText>

        <AppText
          variant="captionStrong"
          className="mt-2 text-center text-textDark"
        >
          {time}
        </AppText>

        <View className="my-7 h-[1px] w-28 bg-border" />

        <AppText variant="body" className="text-center text-textDark">
          {description}
        </AppText>

        <AppText
          variant="captionStrong"
          className="mt-9 text-center text-primaryDark"
        >
          {venueName}
        </AppText>

        <AppText variant="caption" className="mt-1 text-center text-textDark">
          {venueLocation}
        </AppText>
      </View>
    </AppCard>
  );
}
