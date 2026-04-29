// Converts db values that aren't UI friendly to normal looking strings Ex. "ON_LOAN" -> "On Loan", "AVAILABLE" -> "Available"
export function formatDBEnums(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
