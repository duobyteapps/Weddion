import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";

type Props = {
  isLoading?: boolean;
  onPress: () => void;
};

export function GalleryLoadMoreButton({ isLoading = false, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isLoading}
      onPress={onPress}
      className="mb-6 h-14 flex-row items-center justify-center rounded-2xl border border-[#EFE3F7] bg-[#FBF7FD]"
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <AppText className="text-base font-medium text-textMuted">
            Daha Fazla Yükle
          </AppText>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#6B6F92"
            style={{ marginLeft: 8 }}
          />
        </>
      )}
    </TouchableOpacity>
  );
}
