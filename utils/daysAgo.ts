// Format a past date as "today" / "1 day ago" / "N days ago".
//
// Compares *calendar dates* in the user's local timezone, not 24-hour
// windows — otherwise something sent at 9pm yesterday reads "today" until
// 9pm now. Returns null when given a nullish input so callers can spread
// without guarding.

export function daysAgo(dateStr: Date | string | null | undefined): string | null {
  if (!dateStr) return null;

  const then = new Date(dateStr);
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());

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
