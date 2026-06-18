import { supabase } from "@/lib/supabase";
import { InvitationEventType } from "@/types/invitation";

type InvitationEventTypeRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number | null;
};

function mapInvitationEventType(
  row: InvitationEventTypeRow,
): InvitationEventType {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    iconName: row.icon_name,
    sortOrder: row.sort_order ?? 0,
  };
}

export async function getInvitationEventTypes(): Promise<
  InvitationEventType[]
> {
  const { data, error } = await supabase
    .from("invitation_event_types")
    .select("id, slug, title, description, icon_name, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as InvitationEventTypeRow[]).map(mapInvitationEventType);
}
