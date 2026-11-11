/** Static-site presentation; retain the app's consent storage, expiry, and tracking contract. */
import {
  analyticsPreferenceKey,
  readAnalyticsPreference,
  saveAnalyticsPreference,
} from "../src/shared/analytics/analyticsPreferences";
import { createAnalyticsTracking } from "../src/shared/analytics/analyticsTracking";

const bootstrap = document.getElementById("analytics-bootstrap");
const id = bootstrap?.dataset.analyticsId || "";
const banner = document.getElementById("analytics-consent");
const choice = banner?.querySelector<HTMLInputElement>("[data-analytics-choice]");
const close = banner?.querySelector<HTMLButtonElement>("[data-analytics-close]");
if (/^G-[A-Z0-9]+$/.test(id) && banner && choice && close) {
  const tracking = createAnalyticsTracking(id, {
    path: bootstrap?.dataset.pagePath || "/",
    title: document.title,
  });
  let saved = readAnalyticsPreference(id);
  let timer: ReturnType<typeof setTimeout>;
  const apply = (show = saved === null) => {
    clearTimeout(timer);
    const accepted = saved?.choice === "accepted" && saved.expiresAt > Date.now();
    tracking.setEnabled(!!accepted);
    choice.checked = !!accepted;
    banner.hidden = !show;
    if (saved) {
      timer = setTimeout(
        () => {
          saved = readAnalyticsPreference(id);
          apply();
        },
        Math.min(Math.max(saved.expiresAt - Date.now(), 0), 24 * 60 * 60 * 1000),
      );
    }
  };
  const sync = () => {
    saved = readAnalyticsPreference(id);
    apply();
  };
  choice.addEventListener("change", () => {
    saved = saveAnalyticsPreference(id, choice.checked);
    apply(true);
  });
  close.addEventListener("click", () => {
    if (!saved) saved = saveAnalyticsPreference(id, false);
    apply(false);
    document.querySelector<HTMLButtonElement>("[data-analytics-settings]")?.focus();
  });
  document.addEventListener("click", (event) => {
    if ((event.target as Element)?.closest?.("[data-analytics-settings]")) {
      apply(true);
      choice.focus();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === analyticsPreferenceKey(id) || event.key === null) sync();
  });
  window.addEventListener("pageshow", sync);
  apply();
}
