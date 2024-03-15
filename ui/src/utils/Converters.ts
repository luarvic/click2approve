export const getHumanReadableRelativeDate = (date: Date): string => {
  const ago = require("s-ago");
  return ago(date);
};

export const getLocaleDateTimeString = (date: Date): string => {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
