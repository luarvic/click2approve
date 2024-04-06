import { InternalAxiosRequestConfig } from "axios";
import ago from "s-ago";
import {
  ACCOUNT_LOCK_OUT_TIME_IN_MINUTES,
  ACCOUNT_MAX_FAILED_ATTEMPTS_TO_SIGN_IN,
} from "../stores/constantsStore";

export const getHumanReadableRelativeDate = (date: Date): string => {
  return ago(date);
};

export const getLocaleDateTimeString = (date: Date | undefined): string => {
  return date
    ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    : "";
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
      if (error.response.data.hasOwnProperty("detail")) {
        message += message === "" ? "" : " ";
        switch (error.response.data.detail) {
          case "Failed":
          case "NotAllowed":
            message += "(Incorrect credentials or email is not confirmed)";
            break;
          default:
            message += `(Email address is locked out for ${ACCOUNT_LOCK_OUT_TIME_IN_MINUTES} minutes
              after ${ACCOUNT_MAX_FAILED_ATTEMPTS_TO_SIGN_IN} failed attempts to sign in)`;
            break;
        }
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

export const getLoaderName = (
  request: InternalAxiosRequestConfig<any>
): string => {
  const parametersStartIndex = request.url?.indexOf("?");
  return parametersStartIndex && parametersStartIndex > 0
    ? `${request.method}_${request.url?.substring(0, request.url.indexOf("?"))}`
    : `${request.method}_${request.url}`;
};
