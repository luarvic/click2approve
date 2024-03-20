export const getHumanReadableRelativeDate = (date: Date): string => {
  const ago = require("s-ago");
  return ago(date);
};

export const getLocaleDateTimeString = (date: Date): string => {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export const getUserFriendlyApiErrorMessage = (error: any): string => {
  try {
    let message = "";
    if (
      error.hasOwnProperty("response") &&
      error.response.hasOwnProperty("data")
    ) {
      if (error.response.data.hasOwnProperty("title")) {
        message += error.response.data.title;
      }
      if (error.response.data.hasOwnProperty("errors")) {
        message += message === "" ? "" : "\n";
        message += JSON.stringify(error.response.data.errors);
      }
      message = message === "" ? error.response.data : message;
    }
    message = message === "" ? error.message : message;
    return message;
  } catch {
    return "Unknown error occurred.";
  }
};
