import { MaterialCommunityIcons } from "@expo/vector-icons";

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type DowryCategoryImageKey =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "home-decoration"
  | "technology"
  | "other";

export type DowryFilterType = "all" | "completed" | "missing";

export type DowryChecklistItem = {
  id: string;
  title: string;
  brandName?: string | null;
  quantity?: number;
  price?: number | null;
  completed: boolean;
};

export type DowryCategoryDetail = {
  id: DowryCategoryImageKey;
  title: string;
  icon: MaterialIconName;
  imageKey: DowryCategoryImageKey;
  items: DowryChecklistItem[];
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
  title: string;
  brandName: string | null;
  quantity: number;
  price: number | null;
  completed: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type UserDowryItemTableRow = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  category_slug: string;
  brand_name: string | null;
  quantity: number;
  price: number | null;
  completed: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};
