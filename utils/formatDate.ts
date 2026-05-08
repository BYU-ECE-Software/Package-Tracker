// Helper to format a date as MM/DD/YYYY in the user's local timezone.
// Pair with parseFormDate at the submission boundary so stored values
// are real local instants — that way these local methods read back the
// same calendar date the user originally picked.

export const formatDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
