import { supabase } from "@/lib/supabase";
import {
    CreateUserInvitationPayload,
    UserInvitation,
} from "@/types/invitation";

function cleanText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createUserInvitation(
  payload: CreateUserInvitationPayload,
): Promise<UserInvitation> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Davetiye kaydetmek için oturum açmalısınız.");
  }

  const { formData } = payload;

  const { data, error } = await supabase
    .from("user_invitations")
    .insert({
      user_id: user.id,
      template_id: payload.templateId,

      bride_name: formData.brideName.trim(),
      groom_name: formData.groomName.trim(),
      bride_parents: cleanText(formData.brideParents),
      groom_parents: cleanText(formData.groomParents),
      bride_surname: cleanText(formData.brideSurname),
      groom_surname: cleanText(formData.groomSurname),

      event_date: formData.date.trim(),
      event_time: cleanText(formData.time),
      description: cleanText(formData.description),
      venue_name: cleanText(formData.venueName),
      venue_location: cleanText(formData.venueLocation),

      status: payload.status ?? "ready",
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserInvitation;
}

export async function getCurrentUserInvitations(): Promise<UserInvitation[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Oturum bulunamadı.");
  }

  const { data, error } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserInvitation[];
}
