export function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidTime(value: string) {
  const trimmedValue = value.trim();
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  return timeRegex.test(trimmedValue);
}

export function validateTimeField(value: string, fieldName = "Saat") {
  if (!value.trim()) {
    return `${fieldName} alanı boş bırakılamaz.`;
  }

  if (!isValidTime(value)) {
    return `Lütfen geçerli bir ${fieldName.toLocaleLowerCase("tr-TR")} girin. Örnek: 19:30`;
  }

  return null;
}
