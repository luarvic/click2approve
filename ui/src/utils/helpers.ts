import { AxiosError, InternalAxiosRequestConfig } from "axios";
import ago from "s-ago";
import {
  ACCOUNT_LOCK_OUT_TIME_IN_MINUTES,
  ACCOUNT_MAX_FAILED_ATTEMPTS_TO_SIGN_IN,
  UNKNOWN_ERROR_MESSAGE,
} from "../data/constants";

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
    if (!(error instanceof AxiosError)) {
      return error?.message ?? UNKNOWN_ERROR_MESSAGE;
    }

    const data = error.response?.data;
    const parts: string[] = [];
    const status = error.response?.status;

    if (typeof data === "string") {
      const trimmed = data.trim();
      const looksLikeHtml =
        trimmed.startsWith("<") &&
        /<html|<head|<body|<title/i.test(trimmed);

      if (looksLikeHtml) {
        switch (status) {
          case 413:
            return "The file is too large to upload.";
          case 502:
          case 503:
          case 504:
            return "The service is temporarily unavailable. Please try again.";
          case 404:
            return "The requested resource was not found.";
          default:
            return "The server returned an unexpected response.";
        }
      }
    }

    if (data?.title) {
      parts.push(String(data.title));
    }

    if (status === 401 || status === 403) {
      switch (data?.detail) {
        case "Failed":
        case "NotAllowed":
          parts.push("(Incorrect credentials or email is not confirmed)");
          break;
        case "LockedOut":
          parts.push(
            `(Email address is locked out for ${ACCOUNT_LOCK_OUT_TIME_IN_MINUTES} minutes after ${ACCOUNT_MAX_FAILED_ATTEMPTS_TO_SIGN_IN} failed attempts to sign in)`
          );
          break;
        case "InvalidToken":
        case "TokenExpired":
          parts.push("(Your session token is invalid or expired)");
          break;
        default:
          if (data?.detail) {
            parts.push(String(data.detail));
          }
          break;
      }
    }

    if (data?.errors) {
      parts.push(JSON.stringify(data.errors));
    }

    if (data?.traceId) {
      parts.push(`Trace ID: ${data.traceId}`);
    }

    if (parts.length > 0) {
      return parts.join("\n");
    }

    return String(data ?? error.message ?? UNKNOWN_ERROR_MESSAGE);
  } catch {
    return UNKNOWN_ERROR_MESSAGE;
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
