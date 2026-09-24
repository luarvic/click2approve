export const IdentityValidation = {
  passkeyNameLength: 100,
  recoveryCodeLength: 256,
  authenticatorCodeLength: 6,
  authenticatorPeriodSeconds: 30,
} as const;

export const authenticatorCodePattern = new RegExp(`^\\d{${IdentityValidation.authenticatorCodeLength}}$`);
