import { supabase } from "@/lib/supabase";
import { UserDowryItem, UserDowryItemTableRow } from "@/types/dowry";

function mapUserDowryItem(row: UserDowryItemTableRow): UserDowryItem {
  return {
    id: row.id,
    userId: row.user_id,
    dowryAccountId: row.dowry_account_id ?? null,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    title: row.title,
    brandName: row.brand_name,
    quantity: row.quantity,
    price: row.price,
    completed: row.completed,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creatorRole: row.creator_role ?? null,
  };
}

function sortNewestFirst(items: UserDowryItem[]) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return dateB - dateA;
  });
}

export async function getUserDowryItems(
  categorySlug: string,
): Promise<UserDowryItem[]> {
  const { data, error } = await supabase.rpc("get_user_dowry_items", {
    p_category_slug: categorySlug,
  });

  if (error) {
    throw new Error(error.message);
  }

  return sortNewestFirst(
    ((data ?? []) as UserDowryItemTableRow[]).map(mapUserDowryItem),
  );
}

export async function createUserDowryItemByCategorySlug({
  categorySlug,
  title,
  brandName,
  quantity,
  price,
  completed,
}: {
  categorySlug: string;
  title: string;
  brandName?: string;
  quantity: number;
  price?: number | null;
  completed: boolean;
}) {
  const { error } = await supabase.rpc("create_dowry_item", {
    p_category_slug: categorySlug,
    p_title: title.trim(),
    p_brand_name: brandName?.trim() || null,
    p_quantity: quantity,
    p_price: price ?? null,
    p_completed: completed,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleUserDowryItemCompleted({
  itemId,
  completed,
}: {
  itemId: string;
  completed: boolean;
}) {
  const { error } = await supabase.rpc("toggle_dowry_item_completed", {
    p_item_id: itemId,
    p_completed: completed,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUserDowryItem(itemId: string) {
  const { error } = await supabase.rpc("delete_dowry_item", {
    p_item_id: itemId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateUserDowryItem({
  itemId,
  title,
  brandName,
  quantity,
  price,
  completed,
}: {
  itemId: string;
  title: string;
  brandName?: string;
  quantity: number;
  price?: number | null;
  completed: boolean;
}) {
  const { error } = await supabase.rpc("update_dowry_item", {
    p_item_id: itemId,
    p_title: title.trim(),
    p_brand_name: brandName?.trim() || null,
    p_quantity: quantity,
    p_price: price ?? null,
    p_completed: completed,
  });

  if (error) {
    throw new Error(error.message);
  }
}
