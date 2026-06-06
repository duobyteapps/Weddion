export function validateRegisterForm(
  fullName: string,
  email: string,
  password: string,
) {
  if (!fullName.trim()) return "Ad soyad alanı zorunludur.";
  if (!email.trim()) return "E-posta alanı zorunludur.";
  if (!email.includes("@")) return "Geçerli bir e-posta adresi girin.";
  if (!password) return "Şifre alanı zorunludur.";
  if (password.length < 6) return "Şifre en az 6 karakter olmalıdır.";

  return null;
}

export function validateLoginForm(email: string, password: string) {
  if (!email.trim()) return "E-posta alanı zorunludur.";
  if (!email.includes("@")) return "Geçerli bir e-posta adresi girin.";
  if (!password) return "Şifre alanı zorunludur.";

  return null;
}
