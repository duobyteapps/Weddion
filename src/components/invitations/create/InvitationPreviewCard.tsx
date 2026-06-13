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
        <AppText
          variant="serifTitle"
          className="text-center text-[30px] leading-9 text-textDark"
        >
          {formData.brideName}
        </AppText>

        <AppText
          variant="serifTitle"
          className="my-1 text-center text-[28px] text-textDark"
        >
          &
        </AppText>

        <AppText
          variant="serifTitle"
          className="text-center text-[30px] leading-9 text-textDark"
        >
          {formData.groomName}
        </AppText>

        <View className="mt-8 w-full flex-row items-start justify-between gap-4">
          <View className="flex-1 items-center">
            <AppText variant="caption" className="text-center text-textMuted">
              {formData.brideParents}
            </AppText>

            <AppText
              variant="body"
              className="mt-1 text-center font-semibold text-textDark"
            >
              {formData.brideSurname}
            </AppText>
          </View>

          <View className="flex-1 items-center">
            <AppText variant="caption" className="text-center text-textMuted">
              {formData.groomParents}
            </AppText>

            <AppText
              variant="body"
              className="mt-1 text-center font-semibold text-textDark"
            >
              {formData.groomSurname}
            </AppText>
          </View>
        </View>

        <View className="mt-8 w-full flex-row items-center justify-center gap-5">
          <AppText variant="body" className="text-center text-textDark">
            {formatInvitationDate(formData.date)}
          </AppText>

          <View className="h-4 w-px bg-border" />

          <AppText variant="body" className="text-center text-textDark">
            {formData.time}
          </AppText>
        </View>

        <AppText
          variant="body"
          className="mt-6 text-center leading-6 text-textMuted"
        >
          {formData.description}
        </AppText>

        <AppText
          variant="serifSubtitle"
          className="mt-7 text-center text-[20px] text-textDark"
        >
          {formData.venueName}
        </AppText>

        <AppText variant="caption" className="mt-2 text-center text-textMuted">
          {formData.venueLocation}
        </AppText>
      </View>
    </View>
  );

  return (
    <AppCard noPadding className="overflow-hidden py-1 !px-1">
      <View className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-card">
        {imageUrl ? (
          <ImageBackground source={{ uri: imageUrl }} resizeMode="cover">
            {content}
          </ImageBackground>
        ) : (
          content
        )}
      </View>
    </AppCard>
  );
}
