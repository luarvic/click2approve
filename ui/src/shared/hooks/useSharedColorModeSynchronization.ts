import { stores } from "@/app/rootStore";
import { COLOR_MODE_KEY, readColorMode } from "@/shared/session/session";
import { useEffect } from "react";

export const useSharedColorModeSynchronization = (): void => {
  useEffect(() => {
    const synchronizeColorMode = () => {
      const colorMode = readColorMode();
      if (stores.userPreferencesStore.theme.palette.mode !== colorMode) {
        stores.userPreferencesStore.setColorMode(colorMode);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === COLOR_MODE_KEY || event.key === null)) {
        synchronizeColorMode();
      }
    };

    synchronizeColorMode();
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", synchronizeColorMode);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", synchronizeColorMode);
    };
  }, []);
};
