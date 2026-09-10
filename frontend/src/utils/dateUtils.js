export const getLocalDateParts = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return {
    year: date.getFullYear(),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  };
};

export const toDayKey = (value = new Date()) => {
  const { year, month, day } = getLocalDateParts(value);
  return `${year}-${month}-${day}`;
};

export const getTodayDayKey = () => toDayKey(new Date());

export const parseDayKey = (value) => {
  if (!value) return new Date();
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const shiftDayKey = (value, amount) => {
  const date = parseDayKey(value);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
};

export const formatDayKey = (value, options) => {
  return parseDayKey(value).toLocaleDateString('en-US', options);
};

export const toStoredIsoFromDayKey = (value) => {
  const date = parseDayKey(value);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};
