import ago from "s-ago";

export const getHumanReadableRelativeDate = (date: Date): string => {
  return ago(date);
};

export const getLocaleDateTimeString = (date: Date | undefined): string => {
  return date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : "";
};

export const parseUtcDateTime = (value: string): Date => {
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasOffset ? value : `${value}Z`);
};
