export const getEmailInitials = (email: string): string => {
  const localPart = email.split("@")[0]?.trim();
  return (localPart || email).slice(0, 2).toUpperCase();
};
