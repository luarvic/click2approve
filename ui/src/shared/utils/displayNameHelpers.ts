import { UserProfile } from "@/shared/models/userProfile";

interface EmployeeDisplayDetails {
  email?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}

export const unknownEmployeeDisplayName = "Unknown employee";

export const normalizeEmailForDisplay = (email?: string): string => email?.trim().toLowerCase() ?? "";

export const stripInlineEmail = (displayName?: string | null): string =>
  displayName?.replace(/\s+\([^()\s]+@[^()\s]+\)\s*$/, "").trim() ?? "";

export const getUserProfileName = (profile: UserProfile | null, fallback = "User"): string =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() || fallback;

export const getUserDisplayName = (profile: UserProfile | null, email?: string): string => {
  const normalizedEmail = normalizeEmailForDisplay(email);
  const name = getUserProfileName(profile, "");
  return name ? `${name} (${normalizedEmail})` : normalizedEmail;
};

export const getEmployeeDisplayName = (employee?: EmployeeDisplayDetails | null): string => {
  const { firstName, lastName, position, email } = employee ?? {};
  const name = [firstName, lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(" ");
  const title = position?.trim();
  const identity = title ? (name ? `${name}, ${title}` : title) : name;
  return identity || normalizeEmailForDisplay(email) || unknownEmployeeDisplayName;
};
