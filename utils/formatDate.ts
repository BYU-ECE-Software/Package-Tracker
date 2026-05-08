// Helper to format a date as MM/DD/YYYY. Reads the date directly from the
// ISO string (UTC) rather than going through local-tz Date methods, so a
// stored "2026-05-07T00:00:00Z" displays as 05/07/2026 everywhere — no
// shift-back-a-day in timezones behind UTC.

export const formatDate = (value: Date | string): string => {
  const isoString = value instanceof Date ? value.toISOString() : value;
  const [year, month, day] = isoString.split(/[T ]/)[0].split('-');
  return `${month}/${day}/${year}`;
};