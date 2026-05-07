// Helper to format a date as MM/DD/YYYY in the user's local timezone.

export const formatDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};