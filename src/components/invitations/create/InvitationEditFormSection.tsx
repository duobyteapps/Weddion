import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";

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

type FormFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  valueLength: number;
  maxLength: number;
  children: React.ReactNode;
};

function InvitationFormField({
  icon,
  label,
  valueLength,
  maxLength,
  children,
}: FormFieldProps) {
  return (
    <View className="flex-row gap-3">
      <View className="w-[82px] flex-row items-start gap-2 pt-3">
        <Ionicons name={icon} size={22} color={Colors.textMuted} />

        <AppText variant="captionStrong" className="flex-1 text-textMuted">
          {label}
        </AppText>
      </View>

      <View className="flex-1">
        {children}

        <AppText
          variant="caption"
          className="-mt-7 mr-4 self-end text-textMuted"
        >
          {valueLength}/{maxLength}
        </AppText>
      </View>
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
    <AppCard className="rounded-[28px] bg-surface p-5">
      <View className="gap-4">
        <InvitationFormField
          icon="text-outline"
          label="İsimler"
          valueLength={names.length}
          maxLength={50}
        >
          <AppInput
            value={names}
            onChangeText={onChangeNames}
            maxLength={50}
            size="compact"
            inputClassName="pr-14 text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField
          icon="calendar-outline"
          label="Tarih"
          valueLength={date.length}
          maxLength={30}
        >
          <AppInput
            value={date}
            onChangeText={onChangeDate}
            maxLength={30}
            size="compact"
            inputClassName="pr-14 text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField
          icon="time-outline"
          label="Saat"
          valueLength={time.length}
          maxLength={20}
        >
          <AppInput
            value={time}
            onChangeText={onChangeTime}
            maxLength={20}
            size="compact"
            inputClassName="pr-14 text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField
          icon="text"
          label="Açıklama Metni"
          valueLength={description.length}
          maxLength={120}
        >
          <AppInput
            value={description}
            onChangeText={onChangeDescription}
            maxLength={120}
            multiline
            textAlignVertical="top"
            inputClassName="min-h-[86px] pr-14 pt-3 text-textDark"
          />
        </InvitationFormField>

        <InvitationFormField
          icon="location-outline"
          label="Mekan"
          valueLength={venueName.length + venueLocation.length}
          maxLength={100}
        >
          <View className="gap-2">
            <AppInput
              value={venueName}
              onChangeText={onChangeVenueName}
              maxLength={50}
              size="compact"
              inputClassName="pr-14 text-textDark"
            />

            <AppInput
              value={venueLocation}
              onChangeText={onChangeVenueLocation}
              maxLength={50}
              size="compact"
              inputClassName="pr-14 text-textDark"
            />
          </View>
        </InvitationFormField>
      </View>

      <View className="mt-6">
        <AppButton title="Kaydet" onPress={onSave} />
      </View>
    </AppCard>
  );
}
