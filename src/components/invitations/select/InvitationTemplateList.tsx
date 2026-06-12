import { FlatList, View } from "react-native";

import {
    InvitationTemplate,
    InvitationTemplateCard,
} from "./InvitationTemplateCard";

type Props = {
  templates: InvitationTemplate[];
  ListHeaderComponent?: React.ReactElement;
  onPressTemplate?: (template: InvitationTemplate) => void;
  onFavoritePress?: (templateId: string) => void;
};

export function InvitationTemplateList({
  templates,
  ListHeaderComponent,
  onPressTemplate,
  onFavoritePress,
}: Props) {
  return (
    <FlatList
      data={templates}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-32"
      columnWrapperClassName="justify-between"
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => (
        <View className="mb-4 w-[48.5%]">
          <InvitationTemplateCard
            template={item}
            onPress={() => onPressTemplate?.(item)}
            onFavoritePress={() => onFavoritePress?.(item.id)}
          />
        </View>
      )}
    />
  );
}
