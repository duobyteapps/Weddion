import { ReactNode } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";

type Props = {
  names: string;
  date: string;
  time: string;
  description: string;
  venueName: string;
  venueLocation: string;
  onChangeNames: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeTime: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeVenueName: (value: string) => void;
  onChangeVenueLocation: (value: string) => void;
  onSave: () => void;
};

type InvitationFormFieldProps = {
  label: string;
  children: ReactNode;
};

function InvitationFormField({ label, children }: InvitationFormFieldProps) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="w-[82px] pt-3">
        <AppText variant="body" className="text-textMuted">
          {label}
        </AppText>
      </View>

      <View className="flex-1">{children}</View>
    </View>
  );
}

export function InvitationEditFormSection({
  names,
  date,
  time,
  description,
  venueName,
  venueLocation,
  onChangeNames,
  onChangeDate,
  onChangeTime,
  onChangeDescription,
  onChangeVenueName,
  onChangeVenueLocation,
  onSave,
}: Props) {
  return (
    <AppCard>
      <View className="gap-3">
        <InvitationFormField label="İsimler">
          <AppInput
            value={names}
            onChangeText={onChangeNames}
            maxLength={50}
            size="compact"
            inputClassName="text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField label="Tarih">
          <AppInput
            value={date}
            onChangeText={onChangeDate}
            maxLength={30}
            size="compact"
            inputClassName="text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField label="Saat">
          <AppInput
            value={time}
            onChangeText={onChangeTime}
            maxLength={20}
            size="compact"
            inputClassName="text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField label="Açıklama">
          <AppInput
            value={description}
            onChangeText={onChangeDescription}
            maxLength={120}
            multiline
            textAlignVertical="top"
            inputClassName="h-24 pt-3 text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField label="Mekan">
          <AppInput
            value={venueName}
            onChangeText={onChangeVenueName}
            maxLength={50}
            size="compact"
            inputClassName="text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField label="Konum">
          <AppInput
            value={venueLocation}
            onChangeText={onChangeVenueLocation}
            maxLength={50}
            size="compact"
            inputClassName="text-textDark"
          />
        </InvitationFormField>
      </View>

      <View className="mt-6">
        <AppButton title="Kaydet ve Önizle" onPress={onSave} />
      </View>
    </AppCard>
  );
}
