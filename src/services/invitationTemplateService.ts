import { supabase } from "@/lib/supabase";
import { getR2SignedUrl } from "@/services/r2ImageService";

export const INVITATION_TEMPLATE_PAGE_SIZE = 10;

export type InvitationTemplateDto = {
  id: string;
  title: string;
  categoryId: string;
  categorySlug: string | null;
  categoryTitle: string;
  imageUrl: string;
  contentImageUrl: string | null;
  editableImageUrl: string | null;
  imagePath: string;
  contentImagePath: string | null;
  editableImagePath: string | null;
  isFavorite?: boolean;
};

type InvitationTemplateCategoryRelation = {
  id: string;
  slug: string;
  title: string;
};

type InvitationTemplateRow = {
  id: string;
  title: string;
  category_id: string | null;
  image_path: string | null;
  content_image_path: string | null;
  editable_image_path: string | null;
  category:
    | InvitationTemplateCategoryRelation
    | InvitationTemplateCategoryRelation[]
    | null;
};

type GetInvitationTemplatesParams = {
  page?: number;
  pageSize?: number;
  category?: string;
};

function isDirectImageUri(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("file://") ||
    value.startsWith("content://") ||
    value.startsWith("data:image")
  );
}

function getCategoryRelation(
  relation:
    | InvitationTemplateCategoryRelation
    | InvitationTemplateCategoryRelation[]
    | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

async function createR2ImageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (isDirectImageUri(path)) {
    return path;
  }

  try {
    return await getR2SignedUrl(path);
  } catch (error) {
    console.log("Template R2 signed URL oluşturulamadı:", {
      path,
      error,
    });

    return null;
  }
}

async function mapInvitationTemplateRow(
  item: InvitationTemplateRow,
): Promise<InvitationTemplateDto> {
  if (!item.image_path) {
    throw new Error(`${item.title} şablonu için image_path bulunamadı.`);
  }

  const category = getCategoryRelation(item.category);

  const [imageUrl, contentImageUrl, editableImageUrl] = await Promise.all([
    createR2ImageUrl(item.image_path),
    createR2ImageUrl(item.content_image_path),
    createR2ImageUrl(item.editable_image_path),
  ]);

  if (!imageUrl) {
    throw new Error(`${item.title} şablonu için imageUrl oluşturulamadı.`);
  }

  return {
    id: item.id,
    title: item.title,
    categoryId: category?.id ?? item.category_id ?? "",
    categorySlug: category?.slug ?? null,
    categoryTitle: category?.title ?? "Kategori Yok",
    imageUrl,
    contentImageUrl,
    editableImageUrl,
    imagePath: item.image_path,
    contentImagePath: item.content_image_path,
    editableImagePath: item.editable_image_path,
    isFavorite: false,
  };
}

export async function getInvitationTemplates({
  page = 0,
  pageSize = INVITATION_TEMPLATE_PAGE_SIZE,
  category = "all",
}: GetInvitationTemplatesParams = {}): Promise<InvitationTemplateDto[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invitation_templates")
    .select(
      `
        id,
        title,
        category_id,
        image_path,
        content_image_path,
        editable_image_path,
        category:invitation_template_categories!invitation_templates_category_id_fkey (
          id,
          slug,
          title
        )
      `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .range(from, to);

  if (category !== "all") {
    query = query.eq("category_id", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const templates = (data ?? []) as InvitationTemplateRow[];

  const mappedTemplates = await Promise.all(
    templates.map(async (template) => {
      try {
        return await mapInvitationTemplateRow(template);
      } catch (error) {
        console.log("Davetiye şablonu dönüştürülemedi:", {
          templateId: template.id,
          title: template.title,
          error,
        });

        return null;
      }
    }),
  );

  return mappedTemplates.filter(
    (template): template is InvitationTemplateDto => template !== null,
  );
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
        category_id,
        image_path,
        content_image_path,
        editable_image_path,
        category:invitation_template_categories!invitation_templates_category_id_fkey (
          id,
          slug,
          title
        )
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
