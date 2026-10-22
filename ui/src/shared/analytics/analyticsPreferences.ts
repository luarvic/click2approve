export const analyticsPreferenceLifetime = 180 * 24 * 60 * 60 * 1000;

export interface AnalyticsPreference {
  choice: "accepted" | "rejected";
  expiresAt: number;
}

export const analyticsPreferenceKey = (id: string) => `click2approve.analytics-consent.v1.${id}`;

export function readAnalyticsPreference(id: string): AnalyticsPreference | null {
  try {
    const saved = JSON.parse(localStorage.getItem(analyticsPreferenceKey(id)) || "null");
    if (
      ["accepted", "rejected"].includes(saved?.choice) &&
      Number.isFinite(saved.expiresAt) &&
      saved.expiresAt > Date.now()
    ) {
      return saved;
    }
  } catch {
    // Unavailable or invalid storage never grants consent.
  }
  return null;
}

export function saveAnalyticsPreference(id: string, accepted: boolean): AnalyticsPreference {
  const saved: AnalyticsPreference = {
    choice: accepted ? "accepted" : "rejected",
    expiresAt: Date.now() + analyticsPreferenceLifetime,
  };
  try {
    localStorage.setItem(analyticsPreferenceKey(id), JSON.stringify(saved));
  } catch {
    // The current page can still apply an explicit choice without persistence.
  }
  return saved;
}
