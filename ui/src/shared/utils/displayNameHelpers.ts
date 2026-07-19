import { UserProfile } from "@/shared/models/userProfile";

export const normalizeEmailForDisplay = (email?: string): string =>
  email?.trim().toLowerCase() ?? "";

export const getUserDisplayName = (
  profile: UserProfile | null,
  email?: string,
): string => {
  const normalizedEmail = normalizeEmailForDisplay(email);
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name ? `${name} (${normalizedEmail})` : normalizedEmail;
};
