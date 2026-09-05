import passwordValidator from "password-validator";
const passwordMinLength = 8;
const passwordValidatorInstance = new passwordValidator();
passwordValidatorInstance
  .is()
  .min(passwordMinLength)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols();
export const Validation = {
  passwordMinLength,
  emailRegex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i,
  passwordValidator: passwordValidatorInstance,
  passwordValidatorError: `Password must be min ${passwordMinLength} chars,
  have at least one lower case letter,
  one uppercase letter,
  one digit,
  and one symbol`,
} as const;
