import { ScreenHeader } from "@/components/common/ScreenHeader";
import { InvitationEditFormSection } from "@/components/invitations/create/InvitationEditFormSection";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import AppKeyboardAvoidingView from "@/components/ui/AppKeyboardAvoidingView";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { getInvitationEventTypes } from "@/services/invitationEventTypeService";
import {
  getInvitationTemplateById,
  InvitationTemplateDto,
} from "@/services/invitationTemplateService";
import { InvitationEventType, InvitationFormData } from "@/types/invitation";
import { validateTimeField } from "@/utils/timeValidation";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

type EditParams = {
  templateId?: string | string[];
  invitationId?: string | string[];
  shareSlug?: string | string[];
  invitationImageUrl?: string | string[];
  editableImageUrl?: string | string[];

  eventTypeId?: string | string[];
  brideName?: string | string[];
  groomName?: string | string[];
  brideParents?: string | string[];
  groomParents?: string | string[];
  brideSurname?: string | string[];
  groomSurname?: string | string[];
  date?: string | string[];
  time?: string | string[];
  description?: string | string[];
  venueName?: string | string[];
  venueLocation?: string | string[];
};

type InvitationValidationResult = {
  isValid: boolean;
  message?: string;
};

function getParamValue(value?: string | string[]) {
  const resolvedValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = resolvedValue?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function isEmptyValue(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function createEmptyFormData(): InvitationFormData {
  return {
    eventTypeId: "",
    brideName: "",
    groomName: "",
    brideParents: "",
    groomParents: "",
    brideSurname: "",
    groomSurname: "",
    date: "",
    time: "",
    description: "",
    venueName: "",
    venueLocation: "",
  };
}

function createEditFormData(params: EditParams): InvitationFormData {
  return {
    eventTypeId: getParamValue(params.eventTypeId) ?? "",
    brideName: getParamValue(params.brideName) ?? "",
    groomName: getParamValue(params.groomName) ?? "",
    brideParents: getParamValue(params.brideParents) ?? "",
    groomParents: getParamValue(params.groomParents) ?? "",
    brideSurname: getParamValue(params.brideSurname) ?? "",
    groomSurname: getParamValue(params.groomSurname) ?? "",
    date: getParamValue(params.date) ?? "",
    time: getParamValue(params.time) ?? "",
    description: getParamValue(params.description) ?? "",
    venueName: getParamValue(params.venueName) ?? "",
    venueLocation: getParamValue(params.venueLocation) ?? "",
  };
}

function hasFormDataParams(params: EditParams) {
  return Boolean(
    getParamValue(params.eventTypeId) ||
    getParamValue(params.brideName) ||
    getParamValue(params.groomName) ||
    getParamValue(params.brideParents) ||
    getParamValue(params.groomParents) ||
    getParamValue(params.brideSurname) ||
    getParamValue(params.groomSurname) ||
    getParamValue(params.date) ||
    getParamValue(params.time) ||
    getParamValue(params.description) ||
    getParamValue(params.venueName) ||
    getParamValue(params.venueLocation),
  );
}

function createInitialFormData(params: EditParams): InvitationFormData {
  const invitationId = getParamValue(params.invitationId);

  if (invitationId || hasFormDataParams(params)) {
    return createEditFormData(params);
  }

  return createEmptyFormData();
}

function trimInvitationFormData(
  formData: InvitationFormData,
): InvitationFormData {
  return {
    eventTypeId: formData.eventTypeId.trim(),
    brideName: formData.brideName.trim(),
    groomName: formData.groomName.trim(),
    brideParents: formData.brideParents.trim(),
    groomParents: formData.groomParents.trim(),
    brideSurname: formData.brideSurname.trim(),
    groomSurname: formData.groomSurname.trim(),
    date: formData.date.trim(),
    time: formData.time.trim(),
    description: formData.description.trim(),
    venueName: formData.venueName.trim(),
    venueLocation: formData.venueLocation.trim(),
  };
}

function validateInvitationFormData(
  formData: InvitationFormData,
): InvitationValidationResult {
  if (isEmptyValue(formData.eventTypeId)) {
    return {
      isValid: false,
      message: "Lütfen davetiye türünü seçin.",
    };
  }

  if (isEmptyValue(formData.brideName)) {
    return {
      isValid: false,
      message: "Lütfen gelin adını girin.",
    };
  }

  if (isEmptyValue(formData.groomName)) {
    return {
      isValid: false,
      message: "Lütfen damat adını girin.",
    };
  }

  if (isEmptyValue(formData.brideParents)) {
    return {
      isValid: false,
      message: "Lütfen gelin tarafı anne - baba bilgisini girin.",
    };
  }

  if (isEmptyValue(formData.groomParents)) {
    return {
      isValid: false,
      message: "Lütfen damat tarafı anne - baba bilgisini girin.",
    };
  }

  if (isEmptyValue(formData.brideSurname)) {
    return {
      isValid: false,
      message: "Lütfen gelin tarafı soyadını girin.",
    };
  }

  if (isEmptyValue(formData.groomSurname)) {
    return {
      isValid: false,
      message: "Lütfen damat tarafı soyadını girin.",
    };
  }

  if (isEmptyValue(formData.date)) {
    return {
      isValid: false,
      message: "Lütfen davetiye tarihini girin.",
    };
  }

  const timeValidationMessage = validateTimeField(
    formData.time,
    "Davetiye saati",
  );

  if (timeValidationMessage) {
    return {
      isValid: false,
      message: timeValidationMessage,
    };
  }

  if (isEmptyValue(formData.description)) {
    return {
      isValid: false,
      message: "Lütfen davetiye açıklamasını girin.",
    };
  }

  if (isEmptyValue(formData.venueName)) {
    return {
      isValid: false,
      message: "Lütfen mekan adını girin.",
    };
  }

  if (isEmptyValue(formData.venueLocation)) {
    return {
      isValid: false,
      message: "Lütfen mekan konumunu girin.",
    };
  }

  return {
    isValid: true,
  };
}

export default function InvitationFlowEditScreen() {
  const appRouter = useAppNavigation();
  const { showAlert } = useAppAlert();
  const params = useLocalSearchParams<EditParams>();

  const templateId = useMemo(() => {
    return getParamValue(params.templateId);
  }, [params.templateId]);

  const invitationId = useMemo(() => {
    return getParamValue(params.invitationId);
  }, [params.invitationId]);

  const shareSlug = useMemo(() => {
    return getParamValue(params.shareSlug);
  }, [params.shareSlug]);

  const invitationImageUrl = useMemo(() => {
    return getParamValue(params.invitationImageUrl);
  }, [params.invitationImageUrl]);

  const editableImageUrl = useMemo(() => {
    return getParamValue(params.editableImageUrl);
  }, [params.editableImageUrl]);

  const [template, setTemplate] = useState<InvitationTemplateDto | null>(null);
  const [eventTypes, setEventTypes] = useState<InvitationEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);

  const [formData, setFormData] = useState<InvitationFormData>(() =>
    createInitialFormData(params),
  );

  useEffect(() => {
    setFormData(createInitialFormData(params));
  }, [
    templateId,
    invitationId,
    params.eventTypeId,
    params.brideName,
    params.groomName,
    params.brideParents,
    params.groomParents,
    params.brideSurname,
    params.groomSurname,
    params.date,
    params.time,
    params.description,
    params.venueName,
    params.venueLocation,
  ]);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (formData.eventTypeId || eventTypes.length === 0) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      eventTypeId: eventTypes[0].id,
    }));
  }, [eventTypes, formData.eventTypeId]);

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

  async function fetchEventTypes() {
    try {
      setEventTypesLoading(true);
      const data = await getInvitationEventTypes();
      setEventTypes(data);
    } catch (error) {
      console.log("Davetiye türleri alınamadı:", error);
      setEventTypes([]);
    } finally {
      setEventTypesLoading(false);
    }
  }

  function handleChangeField<K extends keyof InvitationFormData>(
    field: K,
    value: InvitationFormData[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSave() {
    if (!template) {
      return;
    }

    const trimmedFormData = trimInvitationFormData(formData);
    const validationResult = validateInvitationFormData(trimmedFormData);

    if (!validationResult.isValid) {
      showAlert({
        type: "warning",
        title: "Eksik bilgi var",
        message:
          validationResult.message ??
          "Lütfen davetiye bilgilerini eksiksiz doldurun.",
        confirmText: "Tamam",
      });

      return;
    }

    const selectedEditableImageUrl =
      editableImageUrl || template.editableImageUrl || template.imageUrl;

    appRouter.push({
      pathname: "/(tabs)/invitation-flow/[templateId]/preview",
      params: {
        templateId: template.id,
        invitationId: invitationId ?? "",
        shareSlug: shareSlug ?? "",
        invitationImageUrl: invitationImageUrl ?? "",
        editableImageUrl: selectedEditableImageUrl ?? "",

        eventTypeId: trimmedFormData.eventTypeId,
        brideName: trimmedFormData.brideName,
        groomName: trimmedFormData.groomName,
        brideParents: trimmedFormData.brideParents,
        groomParents: trimmedFormData.groomParents,
        brideSurname: trimmedFormData.brideSurname,
        groomSurname: trimmedFormData.groomSurname,
        date: trimmedFormData.date,
        time: trimmedFormData.time,
        description: trimmedFormData.description,
        venueName: trimmedFormData.venueName,
        venueLocation: trimmedFormData.venueLocation,
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />

        <AppText variant="body" className="mt-3 text-textMuted">
          Davetiye yükleniyor...
        </AppText>
      </ScreenContainer>
    );
  }

  if (!template) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background px-6">
        <AppText variant="subtitle" className="text-center text-textDark">
          Davetiye bulunamadı.
        </AppText>

        <AppText variant="body" className="mt-2 text-center text-textMuted">
          Seçilen davetiye kaldırılmış veya pasif durumda olabilir.
        </AppText>
      </ScreenContainer>
    );
  }

  const editablePreviewImageUrl =
    editableImageUrl || template.editableImageUrl || template.imageUrl;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <AppKeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-24"
        >
          <ScreenHeader
            title="Davetiyeni Düzenle"
            description="Bilgileri doldur, davetiyeni önizle."
          />

          <InvitationEditSteps activeStep={1} />

          <InvitationPreviewCard
            imageUrl={editablePreviewImageUrl}
            formData={formData}
          />

          <InvitationEditFormSection
            formData={formData}
            eventTypes={eventTypes}
            eventTypesLoading={eventTypesLoading}
            onChangeField={handleChangeField}
            onSave={handleSave}
          />
        </ScrollView>
      </AppKeyboardAvoidingView>
    </ScreenContainer>
  );
}
