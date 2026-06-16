import { MaterialCommunityIcons } from "@expo/vector-icons";

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type DowryFilterType = "all" | "completed" | "missing";

export type DowryChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type DowryCategory = {
  id: string;
  slug: string;
  title: string;
  icon: MaterialIconName;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DowryCategoryItem = {
  id: string;
  slug: string;
  title: string;
  icon: MaterialIconName;
  completed: number;
  total: number;
};

export type DowryCategoryRowItem = DowryCategoryItem;

export type DowryCategoryTableRow = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserDowryItem = {
  id: string;
  userId: string;
  categoryId: string;
  categorySlug: string;
  templateId: string | null;
  title: string;
  brandName: string | null;
  quantity: number;
  completed: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type UserDowryItemTableRow = {
  id: string;
  user_id: string;
  category_id: string;
  category_slug: string;
  template_id: string | null;
  title: string;
  brand_name: string | null;
  quantity: number;
  completed: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};
