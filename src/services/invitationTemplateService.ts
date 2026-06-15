import { InvitationCategory } from "@/components/invitations/select/InvitationCategoryFilter";
import { supabase } from "@/lib/supabase";
import { getR2SignedUrl } from "@/services/r2ImageService";

export type InvitationTemplateDto = {
  id: string;
  title: string;
  category: InvitationCategory;
  categoryTitle: string;

  imageUrl: string;
  contentImageUrl: string | null;
  editableImageUrl: string | null;

  imagePath: string;
  contentImagePath: string | null;
  editableImagePath: string | null;

  isFavorite?: boolean;
};

type InvitationTemplateRow = {
  id: string;
  title: string;
  category: InvitationCategory;
  category_title: string;

  image_path: string | null;
  content_image_path: string | null;
  editable_image_path: string | null;
};

async function createR2ImageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  try {
    return await getR2SignedUrl(path);
  } catch (error) {
    console.log("Template R2 signed URL oluşturulamadı:", error);
    return null;
  }
}

async function mapInvitationTemplateRow(
  item: InvitationTemplateRow,
): Promise<InvitationTemplateDto> {
  const imageUrl = await createR2ImageUrl(item.image_path);
  const contentImageUrl = await createR2ImageUrl(item.content_image_path);
  const editableImageUrl = await createR2ImageUrl(item.editable_image_path);

  if (!item.image_path || !imageUrl) {
    throw new Error(`${item.title} şablonu için image_path bulunamadı.`);
  }

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    categoryTitle: item.category_title,

    imageUrl,
    contentImageUrl,
    editableImageUrl,

    imagePath: item.image_path,
    contentImagePath: item.content_image_path,
    editableImagePath: item.editable_image_path,

    isFavorite: false,
  };
}

export async function getInvitationTemplates(): Promise<
  InvitationTemplateDto[]
> {
  const { data, error } = await supabase
    .from("invitation_templates")
    .select(
      `
      id,
      title,
      category,
      category_title,
      image_path,
      content_image_path,
      editable_image_path
    `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const templates = (data ?? []) as InvitationTemplateRow[];

  return Promise.all(templates.map(mapInvitationTemplateRow));
}

export async function getInvitationTemplateById(
  templateId: string,
): Promise<InvitationTemplateDto | null> {
  const { data, error } = await supabase
    .from("invitation_templates")
    .select(
      `
      id,
      title,
      category,
      category_title,
      image_path,
      content_image_path,
      editable_image_path
    `,
    )
    .eq("id", templateId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapInvitationTemplateRow(data as InvitationTemplateRow);
}
