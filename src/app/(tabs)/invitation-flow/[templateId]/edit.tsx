import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditFormSection } from "@/components/invitations/create/InvitationEditFormSection";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";

function getCacheBustedImageUrl(imageUrl?: string | null, version?: string) {
  if (!imageUrl) {
    return null;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";

  return `${imageUrl}${separator}v=${version ?? Date.now()}`;
}

export default function InvitationFlowEditScreen() {
  const params = useLocalSearchParams<{ templateId?: string | string[] }>();

  const templateId = useMemo(() => {
    if (Array.isArray(params.templateId)) {
      return params.templateId[0];
    }

    return params.templateId;
  }, [params.templateId]);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueLocation, setVenueLocation] = useState("");

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
      console.log("Davetiye şablonu alınamadı:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!template) {
      return;
    }

    const selectedEditableImageUrl =
      template.editableImageUrl || template.imageUrl;

    router.push({
      pathname: "/invitation-flow/[templateId]/preview",
      params: {
        templateId: template.id,
        names,
        date,
        time,
        description,
        venueName,
        venueLocation,
        editableImageUrl: selectedEditableImageUrl,
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator color="#7C3AED" />

          <AppText variant="caption" className="mt-3 text-textMuted">
            Davetiye yükleniyor...
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

          <AppText variant="body" className="mt-2 text-center text-textMuted">
            Seçilen davetiye kaldırılmış veya pasif durumda olabilir.
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  const selectedEditableImageUrl =
    template.editableImageUrl || template.imageUrl;

  const editablePreviewImageUrl = getCacheBustedImageUrl(
    selectedEditableImageUrl,
    template.id,
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Davetiye Düzenle"
          description="Davetiye içeriğinizi düzenleyin."
        />

        <InvitationEditSteps activeStep={1} />

        <View className="mt-5">
          <InvitationPreviewCard
            imageUrl={editablePreviewImageUrl}
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
          />
        </View>

        <View className="mt-5">
          <InvitationEditFormSection
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
            onChangeNames={setNames}
            onChangeDate={setDate}
            onChangeTime={setTime}
            onChangeDescription={setDescription}
            onChangeVenueName={setVenueName}
            onChangeVenueLocation={setVenueLocation}
            onSave={handleSave}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
