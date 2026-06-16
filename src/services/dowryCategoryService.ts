import { supabase } from "@/lib/supabase";
import {
    DowryCategoryItem,
    DowryCategoryTableRow,
    MaterialIconName,
} from "@/types/dowry";

function mapDowryCategory(row: DowryCategoryTableRow): DowryCategoryItem {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    icon: row.icon as MaterialIconName,
    completed: 0,
    total: 0,
  };
}

export async function getDowryCategories(): Promise<DowryCategoryItem[]> {
  const { data, error } = await supabase
    .from("dowry_categories")
    .select("id, slug, title, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.log("Dowry categories supabase error:", error);
    throw new Error(error.message);
  }

  console.log("Dowry categories data:", data);

  return ((data ?? []) as DowryCategoryTableRow[]).map(mapDowryCategory);
}
