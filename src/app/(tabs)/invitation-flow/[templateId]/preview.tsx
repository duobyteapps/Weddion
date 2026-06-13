import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";

export default function InvitationFlowPreviewScreen() {
  const params = useLocalSearchParams<{
    templateId?: string | string[];
    names?: string | string[];
    date?: string | string[];
    time?: string | string[];
    description?: string | string[];
    venueName?: string | string[];
    venueLocation?: string | string[];
    editableImageUrl?: string | string[];
  }>();

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const templateId = Array.isArray(params.templateId)
    ? params.templateId[0]
    : params.templateId;

  const names = Array.isArray(params.names)
    ? params.names[0]
    : (params.names ?? "");

  const date = Array.isArray(params.date)
    ? params.date[0]
    : (params.date ?? "");

  const time = Array.isArray(params.time)
    ? params.time[0]
    : (params.time ?? "");

  const description = Array.isArray(params.description)
    ? params.description[0]
    : (params.description ?? "");

  const venueName = Array.isArray(params.venueName)
    ? params.venueName[0]
    : (params.venueName ?? "");

  const venueLocation = Array.isArray(params.venueLocation)
    ? params.venueLocation[0]
    : (params.venueLocation ?? "");

  const editableImageUrl = Array.isArray(params.editableImageUrl)
    ? params.editableImageUrl[0]
    : params.editableImageUrl;

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  async function fetchTemplate() {
    if (!templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getInvitationTemplateById(templateId);

      setTemplate(data);
    } catch (error) {
      console.log("Davetiye önizleme verisi alınamadı:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function handleShareStep() {
    if (!templateId) {
      return;
    }

    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: {
        templateId,
        names,
        date,
        time,
        description,
        venueName,
        venueLocation,
        editableImageUrl:
          editableImageUrl ||
          template?.editableImageUrl ||
          template?.imageUrl ||
          "",
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7C3AED" />

          <AppText variant="caption" className="mt-3 text-textMuted">
            Önizleme hazırlanıyor...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <AppText variant="subtitle" className="text-center text-textDark">
            Davetiye bulunamadı.
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  const previewImageUrl =
    editableImageUrl || template.editableImageUrl || template.imageUrl;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <InvitationEditSteps activeStep={2} />

        <View className="mt-5">
          <InvitationPreviewCard
            imageUrl={previewImageUrl}
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
          />
        </View>

        <View className="mt-6">
          <AppButton title="Paylaşmaya Geç" onPress={handleShareStep} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
