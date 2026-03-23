////Helper to format date as MM-DD-YYYY

export const formatDate = (value: Date | string): string => {
  const isoString = value instanceof Date ? value.toISOString() : value;
  const [year, month, day] = isoString.split(/[T ]/)[0].split("-");
  return `${month}/${day}/${year}`;
};
