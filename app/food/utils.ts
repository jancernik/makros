export function foodPath(date?: null | string) {
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `/food?date=${date}` : "/food"
}

export function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
