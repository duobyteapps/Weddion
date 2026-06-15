import { supabase } from "@/lib/supabase";
import {
  getAuthenticatedSession,
  getAuthenticatedUser,
} from "@/services/sessionService";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
};

export type UpdateProfilePayload = {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  avatar_url?: string | null;
};

export async function getCurrentUserProfile(): Promise<{
  user: User;
  profile: Profile;
}> {
  const user = await getAuthenticatedUser();

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
  const user = await getAuthenticatedUser();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: payload.first_name.trim() || null,
    last_name: payload.last_name.trim() || null,
    phone: payload.phone.trim() || null,
    birth_date: payload.birth_date || null,
    avatar_url: payload.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCurrentUserAccount() {
  const session = await getAuthenticatedSession();

  const { data, error } = await supabase.functions.invoke("delete-account", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.message ?? "Hesap silinemedi.");
  }

  await supabase.auth.signOut();
}
