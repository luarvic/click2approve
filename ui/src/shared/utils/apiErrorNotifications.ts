import { AccountSecurity, Errors, Notifications } from "@/shared/constants/constants";
import type { ErrorNotification, NotificationDetail } from "@/shared/utils/notifications";
import { isAxiosError } from "axios";

const formatDetailLabel = (key: string): string => {
  if (key === "traceId") {
    return "Trace ID";
  }

  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
};

const toDetailValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value) ?? "";
};

const getAuthenticationErrorMessage = (detail: unknown): string | undefined => {
  switch (detail) {
    case "Failed":
    case "NotAllowed":
      return "Incorrect credentials or email is not confirmed";
    case "LockedOut":
      return `Email address is locked out for ${AccountSecurity.lockOutTimeInMinutes} minutes after ${AccountSecurity.maxFailedAttemptsToSignIn} failed attempts to sign in`;
    case "InvalidToken":
    case "TokenExpired":
      return "Your session token is invalid or expired";
    default:
      return typeof detail === "string" ? detail : undefined;
  }
};

const getResponseDetails = (data: Record<string, unknown>, status?: number): NotificationDetail[] => {
  const details: NotificationDetail[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "title") {
      details.unshift({ label: "Message", value: toDetailValue(value) });
      return;
    }

    if (key === "errors" && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value as Record<string, unknown>).forEach(([field, messages]) => {
        details.push({
          label: `Validation error: ${field}`,
          value: Array.isArray(messages) ? messages.map(String).join(" ") : toDetailValue(messages),
        });
      });
      return;
    }

    details.push({ label: formatDetailLabel(key), value: toDetailValue(value) });
  });

  if (status !== undefined && !data.status) {
    details.unshift({ label: "Status", value: String(status) });
  }

  return details;
};

const trimErrorMessage = (message: string): string => {
  if (message.length <= Notifications.errorMessageMaxLength) {
    return message;
  }

  return `${message.slice(0, Notifications.errorMessageMaxLength - 1).trimEnd()}…`;
};

export const getApiErrorNotification = (error: unknown): ErrorNotification => {
  try {
    if (!isAxiosError(error)) {
      const message = error instanceof Error ? error.message : Errors.unknownMessage;
      return { details: [], message: trimErrorMessage(message) };
    }

    const data = error.response?.data;
    const status = error.response?.status;

    if (typeof data === "string") {
      const trimmed = data.trim();
      const looksLikeHtml =
        trimmed.startsWith("<") && /<html|<head|<body|<title/i.test(trimmed);

      if (looksLikeHtml) {
        switch (status) {
          case 413:
            return { details: [], message: "The file is too large to upload." };
          case 502:
          case 503:
          case 504:
            return { details: [], message: "The service is temporarily unavailable. Please try again." };
          case 404:
            return { details: [], message: "The requested resource was not found." };
          default:
            return { details: [], message: "The server returned an unexpected response." };
        }
      }
    }

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const problemDetails = data as Record<string, unknown>;
      const authenticationMessage = (status === 401 || status === 403)
        ? getAuthenticationErrorMessage(problemDetails.detail)
        : undefined;
      const message = authenticationMessage ??
        (typeof problemDetails.title === "string" ? problemDetails.title : undefined) ??
        (typeof problemDetails.detail === "string" ? problemDetails.detail : undefined) ??
        error.message ??
        Errors.unknownMessage;

      return {
        details: getResponseDetails(problemDetails, status),
        message: trimErrorMessage(message),
      };
    }

    return { details: [], message: trimErrorMessage(String(data ?? error.message ?? Errors.unknownMessage)) };
  } catch {
    return { details: [], message: Errors.unknownMessage };
  }
};

export const isResourceNotFoundOrForbiddenError = (error: unknown): boolean =>
  isAxiosError(error) &&
  (error.response?.status === 403 || error.response?.status === 404);
