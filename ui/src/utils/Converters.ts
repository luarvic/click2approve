export const getHumanReadableRelativeDate = (date: Date): string => {
  const ago = require("s-ago");
  return ago(date);
};
