import { supabase } from "@/lib/supabase";
import {
  DowryCategoryItem,
  DowryCategoryItemCountRow,
  DowryCategoryTableRow,
  MaterialIconName,
} from "@/types/dowry";

type DowryCategoryWithDbId = DowryCategoryItem & {
  dbId: string;
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

  if (categories.length === 0) {
    return [];
  }

  const { data: countData, error: countError } = await supabase.rpc(
    "get_dowry_category_item_counts",
  );

  if (countError) {
    console.log("Dowry item counts supabase error:", countError);
    throw new Error(countError.message);
  }

  const countsByCategorySlug = new Map<
    string,
    {
      total: number;
      completed: number;
    }
  >();

  ((countData ?? []) as DowryCategoryItemCountRow[]).forEach((item) => {
    countsByCategorySlug.set(item.category_slug, {
      total: Number(item.total_count ?? 0),
      completed: Number(item.completed_count ?? 0),
    });
  });

  return categories.map((category) => {
    const counts = countsByCategorySlug.get(category.slug) ?? {
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
