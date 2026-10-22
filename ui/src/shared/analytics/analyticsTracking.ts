import { AnalyticsPage, appAnalyticsPage } from "@/shared/analytics/analyticsPages";
import { analyticsPreferenceLifetime } from "@/shared/analytics/analyticsPreferences";

interface AnalyticsWindow extends Window {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  click2approveAnalytics?: { id: string; lastPage: string };
}

export function createAnalyticsTracking(id: string, publicPage?: AnalyticsPage) {
  const target = window as AnalyticsWindow;
  const disableKey = `ga-disable-${id}`;
  const flags = window as unknown as Record<string, unknown>;
  let initialized = !!document.querySelector(`script[data-analytics-tag="${id}"]`) && !!target.gtag;
  let enabled = false;
  let lastPage = target.click2approveAnalytics?.id === id ? target.click2approveAnalytics.lastPage : "";

  const pageParameters = () => {
    const page = publicPage || appAnalyticsPage(location.pathname, import.meta.env.BASE_URL.replace(/\/$/, ""));
    return { page_location: `${location.origin}${page.path}`, page_title: page.title, page_referrer: "" };
  };
  const trackPage = () => {
    if (!enabled || !target.gtag) return;
    const page = pageParameters();
    // Compare real paths locally, so two resources count as two visits while only templates are sent.
    const navigationKey = publicPage ? page.page_location : location.pathname;
    if (lastPage === navigationKey) return;
    lastPage = navigationKey;
    target.click2approveAnalytics = { id, lastPage };
    target.gtag("set", page);
    target.gtag("event", "page_view", page);
  };
  const clearCookies = () => {
    const domains = ["", ...location.hostname.split(".").map((_, index, parts) => `.${parts.slice(index).join(".")}`)];
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (name !== "_ga" && !name.startsWith("_ga_")) continue;
      for (const domain of domains)
        document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}; SameSite=Lax`;
    }
  };
  const setEnabled = (accepted: boolean) => {
    enabled = accepted;
    flags[disableKey] = !accepted;
    if (!accepted) {
      lastPage = "";
      target.click2approveAnalytics = { id, lastPage };
      clearCookies();
      return;
    }
    if (!initialized) {
      initialized = true;
      target.dataLayer = target.dataLayer || [];
      target.gtag = function () {
        // eslint-disable-next-line prefer-rest-params -- Match the Google tag IArguments command queue.
        target.dataLayer!.push(arguments);
      };
      target.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      target.gtag("consent", "update", { analytics_storage: "granted" });
      target.gtag("js", new Date());
      target.gtag("config", id, {
        ...pageParameters(),
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_expires: analyticsPreferenceLifetime / 1000,
      });
      const script = document.createElement("script");
      script.async = true;
      script.dataset.analyticsTag = id;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.append(script);
    }
    trackPage();
  };

  // The banner also runs outside the router, including public receipt and initial-load pages.
  const push = history.pushState;
  const replace = history.replaceState;
  const onNavigation = () => queueMicrotask(trackPage);
  const wrappedPush: History["pushState"] = function (this: History, ...args) {
    push.apply(this, args);
    onNavigation();
  };
  const wrappedReplace: History["replaceState"] = function (this: History, ...args) {
    replace.apply(this, args);
    onNavigation();
  };
  if (!publicPage) {
    history.pushState = wrappedPush;
    history.replaceState = wrappedReplace;
    window.addEventListener("popstate", onNavigation);
  }
  return {
    setEnabled,
    dispose() {
      enabled = false;
      flags[disableKey] = true;
      if (history.pushState === wrappedPush) history.pushState = push;
      if (history.replaceState === wrappedReplace) history.replaceState = replace;
      window.removeEventListener("popstate", onNavigation);
    },
  };
}
