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

export type DowryCategoryItemCountRow = {
  category_id: string;
  category_slug: string;
  total_count: number;
  completed_count: number;
};

export type UserDowryItem = {
  id: string;
  userId: string;
  dowryAccountId?: string | null;
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
  updatedAt?: string;
};

export type UserDowryItemTableRow = {
  id: string;
  user_id: string;
  dowry_account_id?: string | null;
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
  updated_at?: string;
};

export type DowryAccountRole = "owner" | "member";

export type DowryAccountStatus = "active" | "removed";

export type DowryAccount = {
  id: string;
  title: string;
  ownerUserId: string;
  inviteCode: string;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DowryAccountTableRow = {
  id: string;
  title: string;
  owner_user_id: string;
  invite_code: string;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type DowryAccountMember = {
  id: string;
  dowryAccountId: string;
  userId: string;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type DowryAccountMemberTableRow = {
  id: string;
  dowry_account_id: string;
  user_id: string;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  created_at: string;
  updated_at: string;
};
