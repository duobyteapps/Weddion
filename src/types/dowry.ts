import { MaterialCommunityIcons } from "@expo/vector-icons";

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type DowryCategoryItem = {
  id: string;
  slug?: string;
  title: string;
  icon: MaterialIconName;
  completed: number;
  total: number;
};

export type DowryCategoryTableRow = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};
