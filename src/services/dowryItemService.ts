import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";
import { UserDowryItem, UserDowryItemTableRow } from "@/types/dowry";

function mapUserDowryItem(row: UserDowryItemTableRow): UserDowryItem {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    templateId: row.template_id,
    title: row.title,
    brandName: row.brand_name,
    quantity: row.quantity,
    price: row.price,
    completed: row.completed,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getUserDowryItems(
  categorySlug: string,
): Promise<UserDowryItem[]> {
  await getAuthenticatedUser();

  const { error: syncError } = await supabase.rpc("sync_user_dowry_items", {
    p_category_slug: categorySlug,
  });

  if (syncError) {
    throw new Error(syncError.message);
  }

  const { data, error } = await supabase.rpc("get_user_dowry_items", {
    p_category_slug: categorySlug,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as UserDowryItemTableRow[]).map(mapUserDowryItem);
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
  const user = await getAuthenticatedUser();

  const { data: category, error: categoryError } = await supabase
    .from("dowry_categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const { data: lastItem } = await supabase
    .from("user_dowry_items")
    .select("sort_order")
    .eq("category_id", category.id)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder =
    typeof lastItem?.sort_order === "number" ? lastItem.sort_order + 1 : 1000;

  const { error } = await supabase.from("user_dowry_items").insert({
    user_id: user.id,
    category_id: category.id,
    template_id: null,
    title: title.trim(),
    brand_name: brandName?.trim() || null,
    quantity,
    price: price ?? null,
    completed,
    sort_order: nextSortOrder,
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
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("user_dowry_items")
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUserDowryItem(itemId: string) {
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("user_dowry_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createAdminDowryItemTemplate({
  categoryId,
  title,
  brandName,
  quantity = 1,
  completed = false,
  sortOrder = 0,
}: {
  categoryId: string;
  title: string;
  brandName?: string;
  quantity?: number;
  completed?: boolean;
  sortOrder?: number;
}) {
  const { error } = await supabase.from("dowry_item_templates").insert({
    category_id: categoryId,
    title: title.trim(),
    brand_name: brandName?.trim() || null,
    quantity,
    completed,
    sort_order: sortOrder,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAdminDowryItemTemplate(templateId: string) {
  const { error } = await supabase
    .from("dowry_item_templates")
    .delete()
    .eq("id", templateId);

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
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("user_dowry_items")
    .update({
      title: title.trim(),
      brand_name: brandName?.trim() || null,
      quantity,
      price: price ?? null,
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
