import { Validation } from "@/shared/constants/constants";

export const validateEmails = (emails: string[]): boolean => {
  const invalidEmails = emails.filter((email) => !validateEmail(email));
  return emails.length !== 0 && invalidEmails.length === 0;
};

export const validateEmail = (email: string): boolean => {
  const regexp = new RegExp(Validation.emailRegex);
  return regexp.test(email);
};

export const validatePassword = (password: string): boolean => {
  return Validation.passwordValidator.validate(password) as boolean;
};
