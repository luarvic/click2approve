import {
  EMAIL_VALIDATION_REGEX,
  PASSWORD_VALIDATOR,
} from "../stores/Constants";


export const validateEmails = (emails: string[]): boolean => {
  const invalidEmails = emails.filter((email) => !validateEmail(email));
  return invalidEmails.length === 0;
};

export const validateEmail = (email: string): boolean => {
  const regexp = new RegExp(EMAIL_VALIDATION_REGEX);
  return regexp.test(email);
};

export const validatePassword = (password: string): boolean => {
  return PASSWORD_VALIDATOR.validate(password) as boolean;
};
