import { FieldLimits } from "@/shared/config/fieldLimits";
import { validateEmail } from "@/shared/utils/validators";

export type FieldRule = (value: string) => string | undefined;

export const textRule =
  (label: string, maximum: number, required = false): FieldRule =>
  (value) => {
    if (required && !value.trim()) return `${label} is required.`;
    if (value.length > maximum) return `${label} must not exceed ${maximum.toLocaleString()} characters.`;
    return undefined;
  };

export const emailRule =
  (required = false): FieldRule =>
  (value) =>
    textRule("Email", FieldLimits.email, required)(value) ??
    (value && !validateEmail(value.trim()) ? "Enter a valid email address." : undefined);

export const urlRule: FieldRule = (value) => {
  const error = textRule("URL", FieldLimits.url)(value);
  if (error || !value) return error;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return undefined;
  } catch {
    // Report malformed URLs beside their field.
  }
  return "Enter a valid HTTP or HTTPS URL.";
};

export const signatureRule: FieldRule = (value) => {
  const error = textRule("Signature", FieldLimits.signature)(value);
  if (error || !value) return error;
  try {
    const groups: unknown = JSON.parse(value);
    if (
      Array.isArray(groups) &&
      groups.length &&
      groups.every(
        (group) =>
          Array.isArray(group?.points) &&
          group.points.length &&
          group.points.every(
            (point: { x?: number; y?: number }) => Number.isFinite(point?.x) && Number.isFinite(point?.y),
          ),
      )
    )
      return undefined;
  } catch {
    // Malformed stored signatures can be cleared and drawn again.
  }
  return "Draw a valid signature.";
};

export const futureDateRule =
  (required = false): FieldRule =>
  (value) => {
    if (!value && !required) return undefined;
    return Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now()
      ? undefined
      : "Choose a valid future expiration.";
  };
