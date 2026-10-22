import { stores } from "@/app/rootStore";
import { TOKENS_STORAGE_KEY } from "@/shared/session/session";
import { useEffect } from "react";

/** Synchronizes the browser-wide authentication session when another tab changes it. */
export const useSharedSessionSynchronization = (): void => {
  useEffect(() => {
    const synchronizeSharedSession = (event: StorageEvent) => {
      if (event.key === TOKENS_STORAGE_KEY || event.key === null) {
        void stores.userAccountStore.synchronizeWithSharedSession();
      }
    };

    window.addEventListener("storage", synchronizeSharedSession);
    return () => window.removeEventListener("storage", synchronizeSharedSession);
  }, []);
};
