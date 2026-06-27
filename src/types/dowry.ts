import { MaterialCommunityIcons } from "@expo/vector-icons";

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type DowryCategoryImageKey =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "white-goods"
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
  creatorRole?: DowryAccountRole | null;
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

  budget: number;
  expense: number;
  remaining: number;
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
  creatorRole?: DowryAccountRole | null;
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
  creator_role?: DowryAccountRole | null;
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
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type DowryAccountMemberTableRow = {
  id: string;
  dowry_account_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  role: DowryAccountRole;
  status: DowryAccountStatus;
  created_at: string;
  updated_at: string;
};

export type DowryJoinRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type DowryJoinRequest = {
  id: string;
  dowryAccountId: string;
  requesterUserId: string;
  requesterDisplayName: string | null;
  status: DowryJoinRequestStatus;
  createdAt: string;
};

export type DowryJoinRequestTableRow = {
  id: string;
  dowry_account_id: string;
  requester_user_id: string;
  requester_display_name: string | null;
  status: DowryJoinRequestStatus;
  created_at: string;
};

export type UserDowryCategoryBudgetTableRow = {
  id: string;
  user_id: string;
  category_id: string;
  budget: number | string | null;
  created_at: string;
  updated_at: string;
};

export type UserDowryItemSummaryRow = {
  category_id: string;
  completed: boolean | null;
  quantity: number | null;
  price: number | string | null;
};
