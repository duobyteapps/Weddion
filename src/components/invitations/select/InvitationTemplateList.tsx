import { ReactElement } from "react";
import { FlatList, View } from "react-native";
import {
  InvitationTemplate,
  InvitationTemplateCard,
} from "./InvitationTemplateCard";

type Props = {
  templates: InvitationTemplate[];
  ListHeaderComponent?: ReactElement;
  ListFooterComponent?: ReactElement | null;
  onPressTemplate?: (template: InvitationTemplate) => void;
  onFavoritePress?: (templateId: string) => void;
};

export function InvitationTemplateList({
  templates,
  ListHeaderComponent,
  ListFooterComponent,
  onPressTemplate,
  onFavoritePress,
}: Props) {
  return (
    <FlatList
      data={templates}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-10"
      columnWrapperClassName="justify-between"
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={({ item }) => (
        <View className="mb-5 w-[48%]">
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
