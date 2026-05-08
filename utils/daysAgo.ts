// Format a past date as "today" / "1 day ago" / "N days ago".
//
// Reads the calendar date directly from the ISO string (UTC) rather than
// through local-tz Date methods — otherwise a value stored as UTC midnight
// reads as the previous day in any timezone behind UTC, and "today" becomes
// "1 day ago". Returns null on nullish input so callers can spread without
// guarding.

export function daysAgo(dateStr: Date | string | null | undefined): string | null {
  if (!dateStr) return null;

  const isoString = dateStr instanceof Date ? dateStr.toISOString() : dateStr;
  const [y, m, d] = isoString.split(/[T ]/)[0].split('-').map(Number);
  const startOfThen = new Date(y, m - 1, d);

  const now = new Date();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Math.round (not floor) to absorb DST boundaries — one day can be 23h or 25h.
  const diff = Math.round(
    (startOfNow.getTime() - startOfThen.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}
