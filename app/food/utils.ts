export function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
