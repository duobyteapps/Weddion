import { ImageBackground, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { InvitationTemplateDto } from "@/services/invitationTemplateService";

type Props = {
  template: InvitationTemplateDto;
  names: string;
  date: string;
  time: string;
  description: string;
  venueName: string;
  venueLocation: string;
};

export function InvitationPreviewCard({
  template,
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
    <AppCard noPadding className="overflow-hidden !p-2">
      <ImageBackground
        source={{ uri: template.imageUrl }}
        resizeMode="cover"
        imageClassName="rounded-2xl"
        className="h-[520px] w-full overflow-hidden rounded-2xl"
      >
        <View className="flex-1 items-center justify-center px-7 py-8">
          <AppText
            variant="captionStrong"
            className="text-center tracking-[2px] text-textMuted"
          >
            DAVETLİSİNİZ
          </AppText>

          <AppText
            variant="serifTitle"
            className="mt-8 text-center !text-[52px] !leading-[58px] text-textDark"
          >
            {firstName}
          </AppText>

          <AppText
            variant="serifTitle"
            className="mt-1 text-center !text-[38px] !leading-[42px] text-primaryDark"
          >
            &
          </AppText>

          <AppText
            variant="serifTitle"
            className="mt-1 text-center !text-[52px] !leading-[58px] text-textDark"
          >
            {secondName}
          </AppText>

          <AppText
            variant="subtitle"
            className="mt-8 text-center text-primaryDark"
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
            className="mt-8 text-center text-primaryDark"
          >
            {venueName}
          </AppText>

          <AppText variant="caption" className="mt-1 text-center text-textDark">
            {venueLocation}
          </AppText>
        </View>
      </ImageBackground>
    </AppCard>
  );
}
