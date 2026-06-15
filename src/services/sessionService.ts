import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export const SESSION_EXPIRED_MESSAGE =
  "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";

export function isSessionExpiredError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error ?? "").toLowerCase();

  return (
    message.includes("jwt") ||
    message.includes("token is expired") ||
    message.includes("invalid claims") ||
    message.includes("auth session missing") ||
    message.includes("refresh token") ||
    message.includes("session") ||
    message.includes("expired")
  );
}

export async function clearSessionAndThrow(): Promise<never> {
  await supabase.auth.signOut();
  throw new Error(SESSION_EXPIRED_MESSAGE);
}

export async function getAuthenticatedSession(): Promise<Session> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    if (isSessionExpiredError(error)) {
      await clearSessionAndThrow();
    }

    throw new Error(error.message);
  }

  if (!session) {
    await clearSessionAndThrow();
  }

  return session!;
}

export async function getAuthenticatedUser(): Promise<User> {
  await getAuthenticatedSession();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isSessionExpiredError(error)) {
      await clearSessionAndThrow();
    }

    throw new Error(error.message);
  }

  if (!user) {
    await clearSessionAndThrow();
  }

  return user!;
}
