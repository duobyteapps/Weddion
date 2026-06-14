import { AppCard } from "@/components/ui/AppCard";
import { AppDropdown, AppDropdownOption } from "@/components/ui/AppDropdown";
import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";

export type GalleryEventOption = {
  id: string;
  title: string;
  date: string;
};

type Props = {
  events: GalleryEventOption[];
  selectedEventId?: string;
  onChangeEvent: (eventId: string) => void;
};

export function GalleryEventSummaryCard({
  events,
  selectedEventId,
  onChangeEvent,
}: Props) {
  const selectedEvent = events.find((item) => item.id === selectedEventId);

  const dropdownOptions: AppDropdownOption[] = events.map((event) => ({
    label: event.title,
    value: event.id,
  }));

  return (
    <AppCard
      noMargin
      noPadding
      className="relative mb-4 !overflow-visible !bg-transparent !px-0 pb-6"
    >
      <View className="z-20 w-[56%]">
        <View className="flex-row items-center">
          <AppDropdown
            value={selectedEventId}
            placeholder="Davetiye seç"
            suffix=" Düğünü"
            options={dropdownOptions}
            onChange={onChangeEvent}
            dropdownWidth={190}
          />
        </View>

        <View className="mt-2 flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#A875D1" />

          <AppText variant="caption" className="ml-2 text-textMuted">
            {selectedEvent?.date ?? "Tarih bulunamadı"}
          </AppText>
        </View>
      </View>

      <Image
        source={require("@/assets/images/backgrounds/lavender-grace.png")}
        className="absolute right-[8px] top-[-20px] h-[105px] w-[140px]"
        resizeMode="contain"
      />
    </AppCard>
  );
}
