import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  placeholder?: string;
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

export function AppDateInput({
  label,
  value,
  placeholder = "Tarih seçiniz",
  onChange,
}: Props) {
  const initialDate = value ? new Date(value) : new Date();

  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewDate, setViewDate] = useState(initialDate);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

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

  const changeMonth = (direction: number) => {
    setViewDate(new Date(year, month + direction, 1));
  };

  const selectDay = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const selectYear = (selectedYear: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(selectedYear);

    setSelectedDate(newDate);
    setViewDate(new Date(selectedYear, month, 1));
    setYearPickerVisible(false);
  };

  const confirmDate = () => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");

    onChange(`${y}-${m}-${d}`);
    setVisible(false);
    setYearPickerVisible(false);
  };

  const closeModal = () => {
    setVisible(false);
    setYearPickerVisible(false);
  };

  const years = Array.from({ length: 12 }, (_, index) => yearPageStart + index);

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.input}>
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {formattedValue || placeholder}
          </Text>

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

            <Pressable onPress={() => setYearPickerVisible(true)}>
              <Text style={styles.year}>{selectedDate.getFullYear()}</Text>
            </Pressable>

            <Text style={styles.bigDate}>
              {selectedDate.getDate()}{" "}
              {months[selectedDate.getMonth()].slice(0, 3)}{" "}
              {selectedDate.toLocaleDateString("tr-TR", {
                weekday: "short",
              })}
            </Text>

            <View style={styles.divider} />

            {yearPickerVisible ? (
              <View style={styles.yearPicker}>
                <View style={styles.yearPickerHeader}>
                  <Pressable
                    style={styles.yearArrowButton}
                    onPress={() => setYearPageStart((prev) => prev - 12)}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={Colors.textDark}
                    />
                  </Pressable>

                  <Text style={styles.yearRangeText}>
                    {yearPageStart} - {yearPageStart + 11}
                  </Text>

                  <Pressable
                    style={styles.yearArrowButton}
                    onPress={() => setYearPageStart((prev) => prev + 12)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textDark}
                    />
                  </Pressable>
                </View>

                <View style={styles.yearGrid}>
                  {years.map((itemYear) => {
                    const isSelected = itemYear === selectedDate.getFullYear();

                    return (
                      <Pressable
                        key={itemYear}
                        style={[
                          styles.yearItem,
                          isSelected && styles.selectedYearItem,
                        ]}
                        onPress={() => selectYear(itemYear)}
                      >
                        <Text
                          style={[
                            styles.yearItemText,
                            isSelected && styles.selectedYearItemText,
                          ]}
                        >
                          {itemYear}
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

                  <Text style={styles.monthText}>
                    {months[month]} {year}
                  </Text>

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
                    const isSelected =
                      day === selectedDate.getDate() &&
                      month === selectedDate.getMonth() &&
                      year === selectedDate.getFullYear();

                    return (
                      <Pressable
                        key={index}
                        style={[
                          styles.dayCell,
                          isSelected && styles.selectedDay,
                        ]}
                        disabled={!day}
                        onPress={() => day && selectDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
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
  label: {
    marginBottom: 8,
    fontSize: 13,
    color: Colors.textMuted,
  },
  input: {
    height: 62,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 15,
    color: Colors.textDark,
  },
  placeholder: {
    color: Colors.textLight,
  },
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
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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
  dayText: {
    fontSize: 15,
    color: Colors.textDark,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: "700",
  },
  yearItem: {
    width: "30%",
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedYearItem: {
    backgroundColor: Colors.primary,
  },
  yearItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  selectedYearItemText: {
    color: Colors.white,
    fontWeight: "700",
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
  yearPicker: {
    minHeight: 318,
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  yearPickerHeader: {
    height: 46,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yearArrowButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  yearRangeText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
