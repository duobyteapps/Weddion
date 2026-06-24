import { InvitationCategory } from "@/components/invitations/select/InvitationCategoryFilter";
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

type InvitationTemplateCategoryRow = {
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
};

type GetInvitationTemplatesParams = {
  page?: number;
  pageSize?: number;
  category?: InvitationCategory | "all";
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
  categoryMap: Map<string, InvitationTemplateCategoryRow>,
): Promise<InvitationTemplateDto> {
  if (!item.image_path) {
    throw new Error(`${item.title} şablonu için image_path bulunamadı.`);
  }

  const categoryId = item.category_id ?? "";
  const category = categoryId ? categoryMap.get(categoryId) : null;

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
    categoryId,
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

  const templatesQuery = supabase
    .from("invitation_templates")
    .select(
      `
        id,
        title,
        category_id,
        image_path,
        content_image_path,
        editable_image_path
      `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .range(from, to);

  const filteredTemplatesQuery =
    category !== "all"
      ? templatesQuery.eq("category_id", category)
      : templatesQuery;

  const [templatesResult, categoriesResult] = await Promise.all([
    filteredTemplatesQuery,
    supabase
      .from("invitation_template_categories")
      .select(
        `
          id,
          slug,
          title
        `,
      )
      .eq("is_active", true),
  ]);

  if (templatesResult.error) {
    throw new Error(templatesResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  const templates = (templatesResult.data ?? []) as InvitationTemplateRow[];
  const categories = (categoriesResult.data ??
    []) as InvitationTemplateCategoryRow[];

  const categoryMap = new Map(
    categories.map((categoryItem) => [categoryItem.id, categoryItem]),
  );

  const mappedTemplates = await Promise.all(
    templates.map(async (template) => {
      try {
        return await mapInvitationTemplateRow(template, categoryMap);
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
  const [templateResult, categoriesResult] = await Promise.all([
    supabase
      .from("invitation_templates")
      .select(
        `
          id,
          title,
          category_id,
          image_path,
          content_image_path,
          editable_image_path
        `,
      )
      .eq("id", templateId)
      .eq("is_active", true)
      .maybeSingle(),

    supabase
      .from("invitation_template_categories")
      .select(
        `
          id,
          slug,
          title
        `,
      )
      .eq("is_active", true),
  ]);

  if (templateResult.error) {
    throw new Error(templateResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (!templateResult.data) {
    return null;
  }

  const categories = (categoriesResult.data ??
    []) as InvitationTemplateCategoryRow[];

  const categoryMap = new Map(
    categories.map((categoryItem) => [categoryItem.id, categoryItem]),
  );

  return mapInvitationTemplateRow(
    templateResult.data as InvitationTemplateRow,
    categoryMap,
  );
}
