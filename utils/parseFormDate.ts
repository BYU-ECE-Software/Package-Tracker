// Convert a "YYYY-MM-DD" from a date input into a real Date at the
// user's local time-of-day. Stored values become moments-in-time anchored
// to the local tz, so display helpers using local Date methods
// (getMonth/getDate/...) read back the same calendar date.

export function parseFormDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const now = new Date();
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
}

// Inverse: format a Date as "YYYY-MM-DD" using the user's local timezone.
// Use this for date input default values so "today" matches the user's
// calendar, not UTC's.
export function toFormDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
