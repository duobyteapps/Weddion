import { supabase } from "@/lib/supabase";
import { getR2SignedUrl } from "@/services/r2ImageService";
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

  /**
   * DB'de saklanan gerçek R2 dosya yolu.
   * Örnek: profile-photos/user-id/avatar-123.jpg
   */
  avatar_path: string | null;

  /**
   * DB'de saklanmaz.
   * avatar_path üzerinden anlık oluşturulan signed URL.
   * Sadece ekranda Image source için kullanılır.
   */
  avatar_url: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_path: string | null;
};

export type UpdateProfilePayload = {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_path?: string | null;
};

async function mapProfileRowToProfile(
  profileRow: ProfileRow,
): Promise<Profile> {
  let avatarUrl: string | null = null;

  if (profileRow.avatar_path) {
    try {
      avatarUrl = await getR2SignedUrl(profileRow.avatar_path, true);
    } catch (error) {
      console.log("Profil fotoğrafı signed URL oluşturulamadı:", error);
      avatarUrl = null;
    }
  }

  return {
    ...profileRow,
    avatar_url: avatarUrl,
  };
}

export async function getCurrentUserProfile(): Promise<{
  user: User;
  profile: Profile;
}> {
  const user = await getAuthenticatedUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (profile) {
    return {
      user,
      profile: await mapProfileRowToProfile(profile as ProfileRow),
    };
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      first_name: user.user_metadata?.first_name ?? null,
      last_name: user.user_metadata?.last_name ?? null,
      phone: null,
      avatar_path: null,
      updated_at: new Date().toISOString(),
    })
    .select("id, first_name, last_name, phone, avatar_path")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    user,
    profile: await mapProfileRowToProfile(createdProfile as ProfileRow),
  };
}

export async function updateCurrentUserProfile(
  payload: UpdateProfilePayload,
): Promise<void> {
  const user = await getAuthenticatedUser();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: payload.first_name.trim() || null,
    last_name: payload.last_name.trim() || null,
    phone: payload.phone.trim() || null,
    avatar_path: payload.avatar_path ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCurrentUserAccount(): Promise<void> {
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
