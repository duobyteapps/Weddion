import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  email_notifications: boolean | null;
  sms_notifications: boolean | null;
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
    throw new Error("Oturum bulunamadı.");
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

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      first_name: user.user_metadata?.first_name ?? null,
      last_name: user.user_metadata?.last_name ?? null,
      phone: null,
      birth_date: null,
      avatar_url: null,
      email_notifications: true,
      sms_notifications: true,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
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
    throw new Error("Oturum bulunamadı.");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: payload.first_name.trim() || null,
    last_name: payload.last_name.trim() || null,
    phone: payload.phone.trim() || null,
    birth_date: payload.birth_date || null,
    avatar_url: payload.avatar_url ?? null,
    email_notifications: payload.email_notifications,
    sms_notifications: payload.sms_notifications,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
