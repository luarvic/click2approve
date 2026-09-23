import { Routes } from "@/shared/routing/routes";

const storageKey = "authenticationReturnUrl";
const lifetimeMs = 24 * 60 * 60 * 1000;
const publicPaths = new Set([
  "/signin",
  "/signup",
  "/forgotpassword",
  "/resetpassword",
  "/passwordresetcomplete",
  "/confirmemail",
  "/resendconfirmationemail",
  "/confirmationemailsent",
  "/passwordresetemailsent",
]);

/** Only router-relative internal destinations may be resumed after authentication. */
export const validateReturnUrl = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      [...decoded].some(
        (character) => character === "\\" || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
      )
    )
      return null;
    const url = new URL(value, window.location.origin);
    const pathname = decodeURIComponent(url.pathname);
    if (
      pathname.startsWith("//") ||
      pathname === Routes.defaultPath ||
      url.origin !== window.location.origin ||
      publicPaths.has(pathname.replace(/\/+$/, "").toLowerCase())
    )
      return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

/** Retains the pending destination across reloads and confirmation-email tabs in this browser. */
export const rememberReturnUrl = (value: string): void => {
  const url = validateReturnUrl(value);
  if (!url) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ url, expiresAt: Date.now() + lifetimeMs }));
  } catch {
    // The query parameter still preserves same-tab navigation when storage is unavailable.
  }
};

/** Discards a destination when authentication is intentionally abandoned. */
export const clearPendingReturnUrl = (): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // A storage restriction must not prevent sign-out.
  }
};

const readPendingReturnUrl = (): string | null => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    return stored && typeof stored.expiresAt === "number" && stored.expiresAt > Date.now()
      ? validateReturnUrl(stored.url)
      : null;
  } catch {
    return null;
  }
};

export const getAuthReturnUrl = (search: string): string => {
  const query = new URLSearchParams(search);
  return (
    (query.has("returnUrl") ? validateReturnUrl(query.get("returnUrl")) : readPendingReturnUrl()) ?? Routes.defaultPath
  );
};

export const authPath = (path: string, returnUrl: string): string => {
  const destination = validateReturnUrl(returnUrl);
  return destination ? `${path}?${new URLSearchParams({ returnUrl: destination })}` : path;
};

/** Consume only the destination actually reached, so unrelated tabs cannot discard it. */
export const clearReachedReturnUrl = (path: string): void => {
  if (readPendingReturnUrl() !== path) return;
  clearPendingReturnUrl();
};
