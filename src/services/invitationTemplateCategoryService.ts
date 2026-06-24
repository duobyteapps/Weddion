import type { InvitationCategoryItem } from "@/components/invitations/select/InvitationCategoryFilter";
import { supabase } from "@/lib/supabase";

type InvitationTemplateCategoryRow = {
  id: string;
  slug: string;
  title: string;
  sort_order: number | null;
  is_active: boolean | null;
};

function mapCategoryRowToItem(
  row: InvitationTemplateCategoryRow,
): InvitationCategoryItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
  };
}

export async function getInvitationTemplateCategories(): Promise<
  InvitationCategoryItem[]
> {
  const { data, error } = await supabase
    .from("invitation_template_categories")
    .select(
      `
        id,
        slug,
        title,
        sort_order,
        is_active
      `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as InvitationTemplateCategoryRow[]).map(
    mapCategoryRowToItem,
  );
}
