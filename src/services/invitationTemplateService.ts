import { InvitationCategory } from "@/components/invitations/select/InvitationCategoryFilter";
import { supabase } from "@/lib/supabase";

export type InvitationTemplateDto = {
  id: string;
  title: string;
  category: InvitationCategory;
  categoryTitle: string;
  imageUrl: string;
  isFavorite?: boolean;
};

type InvitationTemplateRow = {
  id: string;
  title: string;
  category: InvitationCategory;
  category_title: string;
  image_url: string;
};

function mapInvitationTemplateRow(
  item: InvitationTemplateRow,
): InvitationTemplateDto {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    categoryTitle: item.category_title,
    imageUrl: item.image_url,
    isFavorite: false,
  };
}

export async function getInvitationTemplates(): Promise<
  InvitationTemplateDto[]
> {
  const { data, error } = await supabase
    .from("invitation_templates")
    .select("id, title, category, category_title, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as InvitationTemplateRow[]).map(
    mapInvitationTemplateRow,
  );
}

export async function getInvitationTemplateById(
  templateId: string,
): Promise<InvitationTemplateDto | null> {
  const { data, error } = await supabase
    .from("invitation_templates")
    .select("id, title, category, category_title, image_url")
    .eq("id", templateId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapInvitationTemplateRow(data as InvitationTemplateRow);
}
