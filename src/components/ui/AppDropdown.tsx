import { AppDivider } from "@/components/ui/AppDivider";
import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  type View as ViewType,
} from "react-native";

export type AppDropdownOption = {
  label: string;
  value: string;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

type Props = {
  value?: string;
  placeholder?: string;
  suffix?: string;
  options: AppDropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  dropdownWidth?: number;
};

export function AppDropdown({
  value,
  placeholder = "Seçiniz",
  suffix = "",
  options,
  onChange,
  className = "",
  dropdownWidth = 145,
}: Props) {
  const triggerRef = useRef<ViewType>(null);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: dropdownWidth,
  });

  const selectedOption = options.find((item) => item.value === value);
  const displayText = selectedOption
    ? `${selectedOption.label}${suffix}`
    : placeholder;

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPosition({
        top: y + height + 4,
        left: x,
        width: dropdownWidth || width,
      });

      setVisible(true);
    });
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        activeOpacity={0.85}
        onPress={openDropdown}
        className={["h-6 flex-row items-center", className].join(" ")}
      >
        <AppText variant="serifSubtitle" numberOfLines={1}>
          {displayText}
        </AppText>

        <Ionicons
          name="chevron-down"
          size={15}
          color="#18214D"
          style={{ marginLeft: 5 }}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable className="flex-1" onPress={() => setVisible(false)}>
          <View
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="overflow-hidden rounded-2xl bg-white"
          >
            {options.map((item, index) => {
              const isSelected = item.value === value;
              const isLastItem = index === options.length - 1;

              return (
                <View key={item.value}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleSelect(item.value)}
                    className="h-[42px] justify-center px-4"
                  >
                    <AppText
                      variant="body"
                      numberOfLines={1}
                      className={isSelected ? "text-primary" : "text-textMuted"}
                    >
                      {item.label}
                    </AppText>
                  </TouchableOpacity>

                  {!isLastItem ? (
                    <View className="px-4">
                      <AppDivider />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
