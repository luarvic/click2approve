import { AuthResponse } from "@/features/identity/models/authResponse";
import { PaletteMode } from "@mui/material";

export const TOKENS_STORAGE_KEY = "tokens";
const COLOR_MODE_KEY: string = "colorMode";
const CURRENT_TENANT_GLOBAL_ID_KEY: string = "currentTenantGlobalId";
const CURRENT_WORK_EMPLOYEE_GLOBAL_ID_KEY: string = "currentWorkEmployeeGlobalId";
const PASSKEY_ENROLLMENT_PROMPT_DISMISSED_KEY: string = "passkeyEnrollmentPromptDismissed";

const getPasskeyEnrollmentPromptDismissedKey = (email: string): string =>
  `${PASSKEY_ENROLLMENT_PROMPT_DISMISSED_KEY}.${encodeURIComponent(email.trim().toLowerCase())}`;

export const writeTokens = (data: AuthResponse) => {
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(data));
};

export const readTokens = (): AuthResponse | null => {
  const dataJson = localStorage.getItem(TOKENS_STORAGE_KEY);
  if (dataJson) {
    return JSON.parse(dataJson) as AuthResponse;
  } else {
    return null;
  }
};

export const deleteTokens = () => {
  localStorage.removeItem(TOKENS_STORAGE_KEY);
};

export const writeColorMode = (colorMode: PaletteMode) => {
  localStorage.setItem(COLOR_MODE_KEY, colorMode);
};

export const readColorMode = (): PaletteMode => {
  const colorMode = localStorage.getItem(COLOR_MODE_KEY);
  if (colorMode) return colorMode as PaletteMode;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const writeCurrentTenantGlobalId = (tenantGlobalId: string) => {
  localStorage.setItem(CURRENT_TENANT_GLOBAL_ID_KEY, tenantGlobalId.toString());
};

export const readCurrentTenantGlobalId = (): string | null => {
  const value = localStorage.getItem(CURRENT_TENANT_GLOBAL_ID_KEY);
  return value || null;
};

export const deleteCurrentTenantGlobalId = () => {
  localStorage.removeItem(CURRENT_TENANT_GLOBAL_ID_KEY);
};

export const writeCurrentWorkEmployeeGlobalId = (employeeGlobalId: string | null) => {
  if (employeeGlobalId) {
    localStorage.setItem(CURRENT_WORK_EMPLOYEE_GLOBAL_ID_KEY, employeeGlobalId);
    return;
  }
  localStorage.removeItem(CURRENT_WORK_EMPLOYEE_GLOBAL_ID_KEY);
};

export const readCurrentWorkEmployeeGlobalId = (): string | null =>
  localStorage.getItem(CURRENT_WORK_EMPLOYEE_GLOBAL_ID_KEY);

export const deleteCurrentWorkEmployeeGlobalId = () => {
  localStorage.removeItem(CURRENT_WORK_EMPLOYEE_GLOBAL_ID_KEY);
};

export const isPasskeyEnrollmentPromptDismissed = (email: string): boolean =>
  localStorage.getItem(getPasskeyEnrollmentPromptDismissedKey(email)) === "true";

export const dismissPasskeyEnrollmentPrompt = (email: string) => {
  localStorage.setItem(getPasskeyEnrollmentPromptDismissedKey(email), "true");
};
