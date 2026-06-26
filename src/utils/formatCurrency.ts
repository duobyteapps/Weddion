export function formatTryCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}
