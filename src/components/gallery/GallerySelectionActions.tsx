import { AppFilterTabItem, AppFilterTabs } from "@/components/ui/AppFilterTabs";
import { AppText } from "@/components/ui/AppText";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

type SelectionAction = "none" | "select-all" | "download" | "delete";

type Props = {
  selectedCount: number;
  allSelected: boolean;
  downloadLoading?: boolean;
  deleteLoading?: boolean;
  onSelectAll: () => void;
  onDownloadSelected: () => void;
  onDeleteSelected: () => void;
  onCancelSelection: () => void;
};

export function GallerySelectionActions({
  selectedCount,
  allSelected,
  downloadLoading = false,
  deleteLoading = false,
  onSelectAll,
  onDownloadSelected,
  onDeleteSelected,
  onCancelSelection,
}: Props) {
  const actionDisabled =
    selectedCount === 0 || downloadLoading || deleteLoading;

  const selectionActionItems: AppFilterTabItem<SelectionAction>[] = [
    {
      id: "select-all",
      title: "Tümünü Seç",
      icon: allSelected ? "check-square" : "square",
      iconSet: "feather",
      variant: "primary",
    },
    {
      id: "download",
      title: "İndir",
      icon: "download",
      iconSet: "feather",
      variant: "primary",
    },
    {
      id: "delete",
      title: "Sil",
      icon: "trash-2",
      iconSet: "feather",
      variant: "danger",
    },
  ];

  const handleChangeAction = (action: SelectionAction) => {
    if (action === "select-all") {
      onSelectAll();
      return;
    }

    if (actionDisabled) {
      return;
    }

    if (action === "download") {
      onDownloadSelected();
      return;
    }

    if (action === "delete") {
      onDeleteSelected();
    }
  };

  return (
    <View className="mb-5">
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <AppText variant="title" className="text-textDark">
            Seçilen Fotoğraflar
          </AppText>

          <AppText className="mt-1 text-[13px] text-textMuted">
            {selectedCount} fotoğraf seçildi
          </AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCancelSelection}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
        >
          <Feather name="x" size={18} color="#18214D" />
        </TouchableOpacity>
      </View>

      <AppFilterTabs
        fullWidth
        className="mb-0"
        items={selectionActionItems}
        selectedValue={allSelected ? "select-all" : "none"}
        onChangeValue={handleChangeAction}
      />
    </View>
  );
}
