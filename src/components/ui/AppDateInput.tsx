import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { LogBox, Platform, Pressable, View } from "react-native";
import { AppText } from "./AppText";

LogBox.ignoreLogs(["DateTimePicker: `onChange` is deprecated"]);

type AppDateInputProps = {
  label?: string;
  value?: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
};

function formatDisplayDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("tr-TR");
}

function formatStorageDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getPickerDate(value?: string | null) {
  if (!value) return new Date();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function AppDateInput({
  label,
  value,
  placeholder = "Tarih seç",
  onChange,
  minimumDate,
  maximumDate,
  className,
}: AppDateInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  const displayValue = formatDisplayDate(value);

  return (
    <View className={className}>
      {label ? (
        <AppText className="mb-2 text-sm font-medium text-textMuted">
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => setShowPicker(true)}
        className="h-14 flex-row items-center justify-between rounded-2xl border border-border bg-card px-4"
      >
        <AppText
          className={`text-[15px] ${
            displayValue ? "text-textDark" : "text-textMuted"
          }`}
        >
          {displayValue || placeholder}
        </AppText>

        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <Ionicons name="calendar-outline" size={20} color="#A875D1" />
        </View>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={getPickerDate(value)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            if (Platform.OS === "android") {
              setShowPicker(false);
            }

            if (selectedDate) {
              onChange(formatStorageDate(selectedDate));
            }
          }}
        />
      ) : null}
    </View>
  );
}
