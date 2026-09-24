// Mirrors the shared domain FieldLimits used by API and persistence validation.
export const FieldLimits = {
  name: 255,
  email: 256,
  phone: 64,
  url: 2048,
  details: 1024,
  text: 4000,
  signature: 16000,
  participantDisplayName: 768,
} as const;
