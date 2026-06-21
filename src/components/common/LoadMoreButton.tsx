import { AppText } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";

type Props = {
  label?: string;
  isLoading?: boolean;
  onPress: () => void;
};

export function LoadMoreButton({
  label = "Daha Fazla Yükle",
  isLoading = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isLoading}
      onPress={onPress}
      className="mt-5 mb-8 h-12 flex-row items-center justify-center rounded-2xl border border-primary/20 bg-white"
    >
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <AppText variant="body" className="font-semibold text-primary">
            {label}
          </AppText>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#7C3AED"
            style={{ marginLeft: 6 }}
          />
        </>
      )}
    </TouchableOpacity>
  );
}
