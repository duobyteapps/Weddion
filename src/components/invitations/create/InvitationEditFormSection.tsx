import { ReactNode, useMemo } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppDateInput } from "@/components/ui/AppDateInput";
import { AppDropdown, AppDropdownOption } from "@/components/ui/AppDropdown";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { InvitationEventType, InvitationFormData } from "@/types/invitation";

type Props = {
  formData: InvitationFormData;
  eventTypes: InvitationEventType[];
  eventTypesLoading?: boolean;
  onChangeField: <K extends keyof InvitationFormData>(
    field: K,
    value: InvitationFormData[K],
  ) => void;
  onSave: () => void;
};

type InvitationFormFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function InvitationFormField({
  label,
  children,
  className = "",
}: InvitationFormFieldProps) {
  return (
    <View className={className}>
      <AppText variant="caption" className="mb-2 text-textMuted">
        {label}
      </AppText>

      {children}
    </View>
  );
}

export function InvitationEditFormSection({
  formData,
  eventTypes,
  eventTypesLoading = false,
  onChangeField,
  onSave,
}: Props) {
  const eventTypeOptions: AppDropdownOption[] = useMemo(
    () =>
      eventTypes.map((eventType) => ({
        label: eventType.title,
        value: eventType.id,
      })),
    [eventTypes],
  );

  return (
    <>
      <AppCard>
        <View className="gap-5">
          <View>
            <InvitationFormField label="Davetiye türü">
              <View className="z-20 mb-4">
                <AppDropdown
                  value={formData.eventTypeId}
                  placeholder={
                    eventTypesLoading ? "Yükleniyor..." : "Davetiye türü seç"
                  }
                  options={eventTypeOptions}
                  onChange={(value) => onChangeField("eventTypeId", value)}
                  dropdownWidth={190}
                />
              </View>
            </InvitationFormField>

            <InvitationFormField label="Gelin adı">
              <AppInput
                value={formData.brideName}
                onChangeText={(value) => onChangeField("brideName", value)}
                placeholder="Gelin adı"
                maxLength={40}
                size="compact"
                inputClassName="text-textDark"
              />
            </InvitationFormField>

            <View className="items-center">
              <AppText
                variant="serifSubtitle"
                className="text-[24px] leading-7 text-primary"
              >
                &
              </AppText>
            </View>

            <InvitationFormField label="Damat adı">
              <AppInput
                value={formData.groomName}
                onChangeText={(value) => onChangeField("groomName", value)}
                placeholder="Damat adı"
                maxLength={40}
                size="compact"
                inputClassName="text-textDark"
              />
            </InvitationFormField>
          </View>

          <View className="h-px bg-border/70" />

          <View className="gap-4">
            <View className="flex-row gap-3">
              <InvitationFormField label="Gelin anne - baba" className="flex-1">
                <AppInput
                  value={formData.brideParents}
                  onChangeText={(value) => onChangeField("brideParents", value)}
                  placeholder="Anne - Baba"
                  maxLength={60}
                  size="compact"
                  inputClassName="text-textDark"
                />
              </InvitationFormField>

              <InvitationFormField label="Damat anne - baba" className="flex-1">
                <AppInput
                  value={formData.groomParents}
                  onChangeText={(value) => onChangeField("groomParents", value)}
                  placeholder="Anne - Baba"
                  maxLength={60}
                  size="compact"
                  inputClassName="text-textDark"
                />
              </InvitationFormField>
            </View>

            <View className="flex-row gap-3">
              <InvitationFormField label="Gelin soyad" className="flex-1">
                <AppInput
                  value={formData.brideSurname}
                  onChangeText={(value) => onChangeField("brideSurname", value)}
                  placeholder="Soyad"
                  maxLength={40}
                  size="compact"
                  inputClassName="text-textDark"
                />
              </InvitationFormField>

              <InvitationFormField label="Damat soyad" className="flex-1">
                <AppInput
                  value={formData.groomSurname}
                  onChangeText={(value) => onChangeField("groomSurname", value)}
                  placeholder="Soyad"
                  maxLength={40}
                  size="compact"
                  inputClassName="text-textDark"
                />
              </InvitationFormField>
            </View>
          </View>

          <View className="h-px bg-border/70" />

          <View className="flex-row gap-3">
            <InvitationFormField label="Tarih" className="flex-1">
              <AppDateInput
                value={formData.date}
                placeholder="Düğün tarihini seçin"
                containerClassName="mt-0"
                inputClassName="h-12"
                onChange={(value) => onChangeField("date", value)}
              />
            </InvitationFormField>

            <InvitationFormField label="Saat" className="w-[105px]">
              <AppInput
                value={formData.time}
                onChangeText={(value) => onChangeField("time", value)}
                placeholder="19.00"
                maxLength={20}
                size="compact"
                inputClassName="text-textDark"
                keyboardType="numbers-and-punctuation"
              />
            </InvitationFormField>
          </View>

          <InvitationFormField label="Açıklama">
            <AppInput
              value={formData.description}
              onChangeText={(value) => onChangeField("description", value)}
              placeholder="Davet açıklaması"
              maxLength={160}
              multiline
              textAlignVertical="top"
              inputClassName="h-28 pt-3 text-textDark"
            />
          </InvitationFormField>

          <View className="flex-row gap-3">
            <InvitationFormField label="Mekan" className="flex-1">
              <AppInput
                value={formData.venueName}
                onChangeText={(value) => onChangeField("venueName", value)}
                placeholder="Mekan"
                maxLength={60}
                size="compact"
                inputClassName="text-textDark"
              />
            </InvitationFormField>

            <InvitationFormField label="Konum" className="flex-1">
              <AppInput
                value={formData.venueLocation}
                onChangeText={(value) => onChangeField("venueLocation", value)}
                placeholder="Konum"
                maxLength={80}
                size="compact"
                inputClassName="text-textDark"
              />
            </InvitationFormField>
          </View>
        </View>
      </AppCard>

      <View>
        <AppButton title="Önizle" onPress={onSave} />
      </View>
    </>
  );
}
