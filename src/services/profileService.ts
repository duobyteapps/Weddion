import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
};

export type UpdateProfilePayload = {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  avatar_url?: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
};

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (profile) {
    return {
      user,
      profile: profile as Profile,
    };
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      first_name: user.user_metadata?.first_name ?? null,
      last_name: user.user_metadata?.last_name ?? null,
      email_notifications: true,
      sms_notifications: true,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    user,
    profile: createdProfile as Profile,
  };
}

export async function updateCurrentUserProfile(payload: UpdateProfilePayload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      phone: payload.phone.trim(),
      birth_date: payload.birth_date || null,
      avatar_url: payload.avatar_url ?? null,
      email_notifications: payload.email_notifications,
      sms_notifications: payload.sms_notifications,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
