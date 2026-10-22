import { AppUpdates } from "@/shared/config/application";
import { useEffect } from "react";

export const useAppVersionCheck = (): void => {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let disposed = false;
    let inFlight = false;
    let reloading = false;
    let activeRequest: AbortController | undefined;

    const check = async () => {
      if (disposed || inFlight || reloading) return;
      inFlight = true;
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = window.setTimeout(() => controller.abort(), AppUpdates.timeoutMs);

      try {
        const response = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/version.json`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) return;

        const version: unknown = await response.json();
        if (
          disposed ||
          typeof version !== "object" ||
          version === null ||
          !("buildId" in version) ||
          typeof version.buildId !== "string" ||
          version.buildId.trim().length === 0 ||
          version.buildId === AppUpdates.buildId
        ) {
          return;
        }

        reloading = true;
        window.location.reload();
      } catch {
        // Retry failed checks at the next interval without interrupting the user.
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
        activeRequest = undefined;
      }
    };

    const checkForUpdates = () => void check();
    checkForUpdates();
    const interval = window.setInterval(checkForUpdates, AppUpdates.checkIntervalMs);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      activeRequest?.abort();
    };
  }, []);
};
