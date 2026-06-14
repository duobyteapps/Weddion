import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewActions } from "@/components/invitations/create/InvitationPreviewActions";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { InvitationPreviewSuccessCard } from "@/components/invitations/create/InvitationPreviewSuccessCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { defaultInvitationContent } from "@/constants/invitationDefaultContent";
import {
  createUserInvitation,
  updateUserInvitation,
} from "@/services/invitationService";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationFormData, UserInvitation } from "@/types/invitation";
import { setCapturedInvitationImageUri } from "@/utils/invitationCaptureStore";

type PreviewParams = {
  templateId: string;
  invitationId?: string;
  shareSlug?: string;
  invitationImageUrl?: string;
  editableImageUrl?: string;

  guestUploadCode?: string;
  guestUploadSlug?: string;
  guestUploadQrValue?: string;

  brideName?: string;
  groomName?: string;
  brideParents?: string;
  groomParents?: string;
  brideSurname?: string;
  groomSurname?: string;
  date?: string;
  time?: string;
  description?: string;
  venueName?: string;
  venueLocation?: string;
};

function getCacheBustedImageUrl(imageUrl?: string | null, version?: string) {
  if (!imageUrl) {
    return null;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${separator}v=${version ?? Date.now()}`;
}

function waitForCaptureReady() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 500);
    });
  });
}

function cleanOptionalParam(value?: string) {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value;
}

export default function InvitationFlowPreviewScreen() {
  const params = useLocalSearchParams<PreviewParams>();
  const invitationCaptureRef = useRef<View>(null);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formData: InvitationFormData = useMemo(
    () => ({
      brideName: params.brideName ?? defaultInvitationContent.brideName,
      groomName: params.groomName ?? defaultInvitationContent.groomName,
      brideParents:
        params.brideParents ?? defaultInvitationContent.brideParents,
      groomParents:
        params.groomParents ?? defaultInvitationContent.groomParents,
      brideSurname:
        params.brideSurname ?? defaultInvitationContent.brideSurname,
      groomSurname:
        params.groomSurname ?? defaultInvitationContent.groomSurname,
      date: params.date ?? defaultInvitationContent.date,
      time: params.time ?? defaultInvitationContent.time,
      description: params.description ?? defaultInvitationContent.description,
      venueName: params.venueName ?? defaultInvitationContent.venueName,
      venueLocation:
        params.venueLocation ?? defaultInvitationContent.venueLocation,
    }),
    [params],
  );

  const previewImageUrl = useMemo(() => {
    return getCacheBustedImageUrl(
      template?.editableImageUrl ?? template?.imageUrl,
      template?.id,
    );
  }, [template]);

  useEffect(() => {
    fetchTemplate();
  }, [params.templateId]);

  async function fetchTemplate() {
    if (!params.templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getInvitationTemplateById(params.templateId);
      setTemplate(data);
    } catch {
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }

  function getBaseRouteParams() {
    return {
      templateId: params.templateId,
      invitationId: params.invitationId ?? "",
      shareSlug: params.shareSlug ?? "",
      invitationImageUrl: params.invitationImageUrl ?? "",
      editableImageUrl:
        params.editableImageUrl ??
        template?.editableImageUrl ??
        template?.imageUrl ??
        "",

      guestUploadCode: params.guestUploadCode ?? "",
      guestUploadSlug: params.guestUploadSlug ?? "",
      guestUploadQrValue: params.guestUploadQrValue ?? "",

      brideName: formData.brideName,
      groomName: formData.groomName,
      brideParents: formData.brideParents,
      groomParents: formData.groomParents,
      brideSurname: formData.brideSurname,
      groomSurname: formData.groomSurname,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      venueName: formData.venueName,
      venueLocation: formData.venueLocation,
    };
  }

  function getShareRouteParams(invitation: UserInvitation) {
    return {
      ...getBaseRouteParams(),
      invitationId: invitation.id,
      shareSlug: invitation.share_slug ?? params.shareSlug ?? "",
      invitationImageUrl:
        cleanOptionalParam(invitation.invitation_image_url ?? undefined) ??
        params.invitationImageUrl ??
        "",
      guestUploadCode:
        cleanOptionalParam(invitation.guest_upload_code ?? undefined) ?? "",
      guestUploadSlug:
        cleanOptionalParam(invitation.guest_upload_slug ?? undefined) ?? "",
      guestUploadQrValue:
        cleanOptionalParam(invitation.guest_upload_qr_value ?? undefined) ?? "",
    };
  }

  function handleEditStep() {
    router.push({
      pathname: "/invitation-flow/[templateId]/edit",
      params: getBaseRouteParams(),
    });
  }

  async function captureInvitationImage() {
    await waitForCaptureReady();

    const capturedImageUri = await captureRef(invitationCaptureRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    setCapturedInvitationImageUri(capturedImageUri);

    return capturedImageUri;
  }

  async function saveInvitation(capturedImageUri?: string) {
    if (params.invitationId) {
      return updateUserInvitation({
        invitationId: params.invitationId,
        templateId: params.templateId,
        formData,
        status: "ready",
        capturedImageUri,
      });
    }

    return createUserInvitation({
      templateId: params.templateId,
      formData,
      status: "ready",
      capturedImageUri,
    });
  }

  async function handleShareStep() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      let capturedImageUri: string | undefined;

      try {
        capturedImageUri = await captureInvitationImage();
      } catch {
        capturedImageUri = undefined;
      }

      const invitation = await saveInvitation(capturedImageUri);

      router.push({
        pathname: "/invitation-flow/[templateId]/share",
        params: getShareRouteParams(invitation),
      });
    } catch (error) {
      Alert.alert(
        "Davetiye kaydedilemedi",
        error instanceof Error
          ? error.message
          : "Davetiye kaydedilirken bir hata oluştu.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A875D1" />
          <AppText className="mt-3">Önizleme hazırlanıyor...</AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <AppText variant="subtitle" className="text-center text-textDark">
            Davetiye bulunamadı.
          </AppText>

          <AppText className="mt-2 text-center">
            Seçilen davetiye kaldırılmış veya pasif durumda olabilir.
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Önizle"
          description="Davetiyenizin son halini kontrol edin."
          backTo={{
            pathname: "/invitation-flow/[templateId]/edit",
            params: getBaseRouteParams(),
          }}
        />

        <InvitationEditSteps activeStep={2} />

        <View ref={invitationCaptureRef} collapsable={false}>
          <InvitationPreviewCard
            imageUrl={previewImageUrl}
            formData={formData}
          />
        </View>

        <InvitationPreviewSuccessCard />

        <InvitationPreviewActions
          onEditPress={handleEditStep}
          onSharePress={handleShareStep}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
