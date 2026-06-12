import { InvitationCategory } from "@/components/invitations/select/InvitationCategoryFilter";
import { supabase } from "@/lib/supabase";

export type InvitationTemplateDto = {
  id: string;
  title: string;
  category: InvitationCategory;
  categoryTitle: string;
  imageUrl: string;
  contentImageUrl?: string | null;
  editableImageUrl?: string | null;
  isFavorite?: boolean;
};

type InvitationTemplateRow = {
  id: string;
  title: string;
  category: InvitationCategory;
  category_title: string;
  image_url: string;
  content_image_url?: string | null;
  editable_image_url?: string | null;
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
    contentImageUrl: item.content_image_url ?? null,
    editableImageUrl: item.editable_image_url ?? null,
    isFavorite: false,
  };
}

const INVITATION_TEMPLATE_SELECT =
  "id, title, category, category_title, image_url, content_image_url, editable_image_url";

export async function getInvitationTemplates(): Promise<
  InvitationTemplateDto[]
> {
  const { data, error } = await supabase
    .from("invitation_templates")
    .select(INVITATION_TEMPLATE_SELECT)
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
    .select(INVITATION_TEMPLATE_SELECT)
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
