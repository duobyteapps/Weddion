// src/utils/authValidation.ts
export function validateRegisterForm(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  if (!firstName.trim()) {
    return "Ad alanı boş bırakılamaz.";
  }

  if (!lastName.trim()) {
    return "Soyad alanı boş bırakılamaz.";
  }

  if (!email.trim()) {
    return "E-posta alanı boş bırakılamaz.";
  }

  if (!password.trim()) {
    return "Şifre alanı boş bırakılamaz.";
  }

  if (password.length < 6) {
    return "Şifre en az 6 karakter olmalıdır.";
  }

  return null;
}

export function validateLoginForm(email: string, password: string) {
  if (!email.trim()) return "E-posta alanı zorunludur.";
  if (!email.includes("@")) return "Geçerli bir e-posta adresi girin.";
  if (!password) return "Şifre alanı zorunludur.";

  return null;
}
