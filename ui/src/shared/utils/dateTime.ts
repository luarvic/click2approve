import ago from "s-ago";

export const getHumanReadableRelativeDate = (date: Date): string => {
  return ago(date);
};

export const getLocaleDateTimeString = (date: Date | undefined): string => {
  return date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : "";
};

export const getLocaleDateTimeWithSecondsString = (date: Date | undefined): string | undefined =>
  date?.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
  });

export const parseUtcDateTime = (value: string): Date => {
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasOffset ? value : `${value}Z`);
};
