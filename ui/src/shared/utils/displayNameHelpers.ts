import { UserProfile } from "@/shared/models/userProfile";

export const normalizeEmailForDisplay = (email?: string): string =>
  email?.trim().toLowerCase() ?? "";

export const getUserProfileName = (
  profile: UserProfile | null,
  fallback = "User",
): string =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
  fallback;

export const getUserDisplayName = (
  profile: UserProfile | null,
  email?: string,
): string => {
  const normalizedEmail = normalizeEmailForDisplay(email);
  const name = getUserProfileName(profile, "");
  return name ? `${name} (${normalizedEmail})` : normalizedEmail;
};
