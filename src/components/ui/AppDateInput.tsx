import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AppText } from "./AppText";

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  maximumDate?: Date;
  onChange: (value: string) => void;
};

const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const days = ["P", "S", "Ç", "P", "C", "C", "P"];

const weekDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export function AppDateInput({
  label,
  value,
  placeholder = "Tarih seçiniz",
  maximumDate,
  onChange,
}: Props) {
  const initialDate = value ? new Date(value) : new Date();

  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewDate, setViewDate] = useState(initialDate);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const [yearPageStart, setYearPageStart] = useState(
    initialDate.getFullYear() - 5,
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const mondayFirstIndex = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(mondayFirstIndex).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [year, month]);

  const formattedValue = value
    ? new Date(value).toLocaleDateString("tr-TR")
    : "";

  const isAfterMaximumDate = (date: Date) => {
    if (!maximumDate) return false;

    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const maxDate = new Date(
      maximumDate.getFullYear(),
      maximumDate.getMonth(),
      maximumDate.getDate(),
    );

    return targetDate > maxDate;
  };

  const changeMonth = (direction: number) => {
    const newViewDate = new Date(year, month + direction, 1);

    if (maximumDate) {
      const maxMonthDate = new Date(
        maximumDate.getFullYear(),
        maximumDate.getMonth(),
        1,
      );

      if (newViewDate > maxMonthDate) return;
    }

    setViewDate(newViewDate);
  };

  const selectDay = (day: number) => {
    const newDate = new Date(year, month, day);

    if (isAfterMaximumDate(newDate)) return;

    setSelectedDate(newDate);
  };

  const selectYear = (selectedYear: number) => {
    let newMonth = month;
    let newDay = selectedDate.getDate();

    if (maximumDate && selectedYear === maximumDate.getFullYear()) {
      newMonth = Math.min(newMonth, maximumDate.getMonth());
    }

    const lastDayOfMonth = new Date(selectedYear, newMonth + 1, 0).getDate();
    newDay = Math.min(newDay, lastDayOfMonth);

    let newDate = new Date(selectedYear, newMonth, newDay);

    if (isAfterMaximumDate(newDate) && maximumDate) {
      newDate = maximumDate;
      newMonth = maximumDate.getMonth();
    }

    setSelectedDate(newDate);
    setViewDate(new Date(selectedYear, newMonth, 1));
    setYearPickerVisible(false);
  };

  const selectMonth = (selectedMonth: number) => {
    const currentDay = selectedDate.getDate();
    const lastDayOfSelectedMonth = new Date(
      year,
      selectedMonth + 1,
      0,
    ).getDate();

    const safeDay = Math.min(currentDay, lastDayOfSelectedMonth);
    const newDate = new Date(year, selectedMonth, safeDay);

    if (isAfterMaximumDate(newDate)) return;

    setSelectedDate(newDate);
    setViewDate(new Date(year, selectedMonth, 1));
    setMonthPickerVisible(false);
  };

  const confirmDate = () => {
    if (isAfterMaximumDate(selectedDate)) return;

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");

    onChange(`${y}-${m}-${d}`);
    setVisible(false);
    setYearPickerVisible(false);
    setMonthPickerVisible(false);
  };

  const closeModal = () => {
    setVisible(false);
    setYearPickerVisible(false);
    setMonthPickerVisible(false);
  };

  const openYearPicker = () => {
    setMonthPickerVisible(false);
    setYearPickerVisible(true);
  };

  const openMonthPicker = () => {
    setYearPickerVisible(false);
    setMonthPickerVisible(true);
  };

  const years = Array.from({ length: 12 }, (_, index) => yearPageStart + index);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} className="mt-4 gap-1.5">
        <AppText variant="caption" className="text-textMuted">
          {label}
        </AppText>

        <View
          className="
            h-12
            flex-row
            items-center
            justify-between
            rounded-xl
            border
            border-border
            bg-surfaceLight
            px-4
          "
        >
          <AppText className={value ? "text-text" : "text-textMuted"}>
            {formattedValue || placeholder}
          </AppText>

          <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
        </View>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/backgrounds/date-flower.png")}
              style={styles.flower}
              resizeMode="contain"
            />

            <Pressable onPress={openYearPicker}>
              <Text style={styles.year}>{selectedDate.getFullYear()}</Text>
            </Pressable>

            <Text style={styles.bigDate}>
              {selectedDate.getDate()}{" "}
              {months[selectedDate.getMonth()].slice(0, 3)}{" "}
              {weekDays[selectedDate.getDay()]}
            </Text>

            <View style={styles.divider} />

            {yearPickerVisible ? (
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Pressable
                    style={styles.circleButton}
                    onPress={() => setYearPageStart((prev) => prev - 12)}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={Colors.textDark}
                    />
                  </Pressable>

                  <Text style={styles.pickerTitle}>
                    {yearPageStart} - {yearPageStart + 11}
                  </Text>

                  <Pressable
                    style={styles.circleButton}
                    onPress={() => setYearPageStart((prev) => prev + 12)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textDark}
                    />
                  </Pressable>
                </View>

                <View style={styles.optionGrid}>
                  {years.map((itemYear) => {
                    const isSelected = itemYear === selectedDate.getFullYear();
                    const isDisabled =
                      maximumDate && itemYear > maximumDate.getFullYear();

                    return (
                      <Pressable
                        key={itemYear}
                        disabled={isDisabled}
                        style={[
                          styles.optionItem,
                          isSelected && styles.selectedOptionItem,
                          isDisabled && styles.disabledOptionItem,
                        ]}
                        onPress={() => selectYear(itemYear)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText,
                            isDisabled && styles.disabledOptionText,
                          ]}
                        >
                          {itemYear}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : monthPickerVisible ? (
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <View style={styles.emptyCircle} />

                  <Text style={styles.pickerTitle}>{year} Ay Seçimi</Text>

                  <View style={styles.emptyCircle} />
                </View>

                <View style={styles.optionGrid}>
                  {months.map((itemMonth, index) => {
                    const isSelected = index === month;
                    const isDisabled =
                      maximumDate &&
                      year === maximumDate.getFullYear() &&
                      index > maximumDate.getMonth();

                    return (
                      <Pressable
                        key={itemMonth}
                        disabled={isDisabled}
                        style={[
                          styles.optionItem,
                          isSelected && styles.selectedOptionItem,
                          isDisabled && styles.disabledOptionItem,
                        ]}
                        onPress={() => selectMonth(index)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText,
                            isDisabled && styles.disabledOptionText,
                          ]}
                        >
                          {itemMonth.slice(0, 3)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <>
                <View style={styles.monthRow}>
                  <Pressable
                    style={styles.circleButton}
                    onPress={() => changeMonth(-1)}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={Colors.textDark}
                    />
                  </Pressable>

                  <Pressable onPress={openMonthPicker}>
                    <Text style={styles.monthText}>
                      {months[month]} {year}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.circleButton}
                    onPress={() => changeMonth(1)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.textDark}
                    />
                  </Pressable>
                </View>

                <View style={styles.daysRow}>
                  {days.map((day, index) => (
                    <Text key={`${day}-${index}`} style={styles.dayName}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.grid}>
                  {calendarDays.map((day, index) => {
                    const currentDate =
                      day !== null ? new Date(year, month, day) : null;

                    const isSelected =
                      day === selectedDate.getDate() &&
                      month === selectedDate.getMonth() &&
                      year === selectedDate.getFullYear();

                    const isDisabled =
                      currentDate !== null && isAfterMaximumDate(currentDate);

                    return (
                      <Pressable
                        key={index}
                        style={[
                          styles.dayCell,
                          isSelected && styles.selectedDay,
                          isDisabled && styles.disabledDay,
                        ]}
                        disabled={!day || isDisabled}
                        onPress={() => day && selectDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            isDisabled && styles.disabledDayText,
                          ]}
                        >
                          {day ?? ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.footer}>
              <Pressable onPress={closeModal}>
                <Text style={styles.cancelText}>İPTAL</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={confirmDate}>
                <Text style={styles.confirmText}>TAMAM</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(47, 38, 56, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  flower: {
    position: "absolute",
    right: -8,
    top: 16,
    width: 130,
    height: 100,
    opacity: 0.45,
  },
  year: {
    marginTop: 26,
    marginLeft: 26,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  bigDate: {
    marginTop: 12,
    marginLeft: 26,
    marginBottom: 22,
    fontSize: 34,
    fontWeight: "700",
    color: Colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSoft,
  },
  monthRow: {
    height: 78,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  daysRow: {
    flexDirection: "row",
    paddingHorizontal: 26,
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 26,
    paddingBottom: 22,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  disabledDay: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 15,
    color: Colors.textDark,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: "700",
  },
  disabledDayText: {
    color: Colors.textMuted,
  },
  pickerContent: {
    minHeight: 318,
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  pickerHeader: {
    height: 46,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCircle: {
    width: 38,
    height: 38,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionItem: {
    width: "30%",
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOptionItem: {
    backgroundColor: Colors.primary,
  },
  disabledOptionItem: {
    opacity: 0.35,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  selectedOptionText: {
    color: Colors.white,
    fontWeight: "700",
  },
  disabledOptionText: {
    color: Colors.textMuted,
  },
  footer: {
    height: 78,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    paddingHorizontal: 26,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 24,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  confirmButton: {
    height: 48,
    minWidth: 124,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});
