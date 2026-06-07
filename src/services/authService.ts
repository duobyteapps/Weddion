// src/services/authService.ts
import { supabase } from "@/lib/supabase";

type RegisterUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginUserParams = {
  email: string;
  password: string;
};

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
}: RegisterUserParams) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function loginUser({ email, password }: LoginUserParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}
