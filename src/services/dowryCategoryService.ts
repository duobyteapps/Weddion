import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";
import {
  DowryCategoryItem,
  DowryCategoryTableRow,
  MaterialIconName,
} from "@/types/dowry";

type DowryCategoryWithDbId = DowryCategoryItem & {
  dbId: string;
};

type UserDowryItemCountRow = {
  category_id: string;
  completed: boolean;
};

function mapDowryCategory(row: DowryCategoryTableRow): DowryCategoryWithDbId {
  return {
    id: row.slug,
    dbId: row.id,
    slug: row.slug,
    title: row.title,
    icon: row.icon as MaterialIconName,
    completed: 0,
    total: 0,
  };
}

export async function getDowryCategories(): Promise<DowryCategoryItem[]> {
  const user = await getAuthenticatedUser();

  const { data: categoryData, error: categoryError } = await supabase
    .from("dowry_categories")
    .select("id, slug, title, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoryError) {
    console.log("Dowry categories supabase error:", categoryError);
    throw new Error(categoryError.message);
  }

  const categories = ((categoryData ?? []) as DowryCategoryTableRow[]).map(
    mapDowryCategory,
  );

  const categoryIds = categories.map((category) => category.dbId);

  if (categoryIds.length === 0) {
    return [];
  }

  const { data: itemData, error: itemError } = await supabase
    .from("user_dowry_items")
    .select("category_id, completed")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .in("category_id", categoryIds);

  if (itemError) {
    console.log("Dowry item counts supabase error:", itemError);
    throw new Error(itemError.message);
  }

  const countsByCategoryId = new Map<
    string,
    {
      total: number;
      completed: number;
    }
  >();

  ((itemData ?? []) as UserDowryItemCountRow[]).forEach((item) => {
    const current = countsByCategoryId.get(item.category_id) ?? {
      total: 0,
      completed: 0,
    };

    countsByCategoryId.set(item.category_id, {
      total: current.total + 1,
      completed: current.completed + (item.completed ? 1 : 0),
    });
  });

  return categories.map((category) => {
    const counts = countsByCategoryId.get(category.dbId) ?? {
      total: 0,
      completed: 0,
    };

    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      icon: category.icon,
      completed: counts.completed,
      total: counts.total,
    };
  });
}
