import { FieldRule } from "@/shared/utils/formValidation";
import { notification, subscribeToNotifications } from "@/shared/utils/notifications";
import { useEffect, useState } from "react";

/** Submit-time errors disappear when their field is edited, matching identity forms. */
export const useFormValidation = <T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, FieldRule>>,
  serverFields: Partial<Record<keyof T, string>> = {},
) => {
  const [failures, setFailures] = useState<Partial<Record<keyof T, { message: string; value: string }>>>({});
  useEffect(() => {
    setFailures((current) => {
      const entries = Object.entries(current).filter(([name, failure]) => failure?.value === values[name]);
      return entries.length === Object.keys(current).length ? current : (Object.fromEntries(entries) as typeof current);
    });
  }, [values]);
  const message = (name: keyof T) => (failures[name]?.value === values[name] ? failures[name]?.message : undefined);
  const field = (name: keyof T) => ({ error: Boolean(message(name)), helperText: message(name) });
  const validate = () => {
    const next: typeof failures = {};
    for (const name of Object.keys(rules) as (keyof T)[]) {
      const error = rules[name]?.(values[name]);
      if (error) next[name] = { message: error, value: values[name] };
    }
    setFailures(next);
    if (Object.keys(next).length) {
      notification.warning("Invalid input.");
      return false;
    }
    return true;
  };
  // API stores report failures through the shared notification formatter. Listen only
  // while this form's save is running, retaining diagnostics in the usual Details action.
  const run = async <R>(action: () => Promise<R>): Promise<R> => {
    let initial = true;
    const unsubscribe = subscribeToNotifications((notifications) => {
      if (initial) {
        initial = false;
        return;
      }
      const next: typeof failures = {};
      for (const detail of notifications.flatMap((item) => item.details)) {
        if (!detail.label.startsWith("Validation error: ")) continue;
        const property = detail.label.slice("Validation error: ".length).toLowerCase();
        const key = Object.keys(values).find((key) => (serverFields[key] ?? key).toLowerCase() === property) as
          | keyof T
          | undefined;
        if (key) next[key] = { message: detail.value, value: values[key] };
      }
      if (Object.keys(next).length) setFailures((current) => ({ ...current, ...next }));
    });
    try {
      return await action();
    } finally {
      unsubscribe();
    }
  };
  return { field, message, reset: () => setFailures({}), run, validate };
};
