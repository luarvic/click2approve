import { stores } from "@/app/rootStore";
import { useCallback, useRef, useState } from "react";

export const useAsyncAction = (actionLoader?: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);

  const run = useCallback(
    async <T>(action: () => Promise<T>, actionLoaderOverride?: string): Promise<T | undefined> => {
      if (isRunningRef.current) {
        return undefined;
      }

      const currentActionLoader = actionLoaderOverride ?? actionLoader;
      isRunningRef.current = true;
      if (currentActionLoader) {
        stores.commonStore.updateActionLoadingCounter(currentActionLoader, 1);
      }
      setIsRunning(true);
      try {
        return await action();
      } finally {
        if (currentActionLoader) {
          stores.commonStore.updateActionLoadingCounter(currentActionLoader, -1);
        }
        isRunningRef.current = false;
        setIsRunning(false);
      }
    },
    [actionLoader],
  );

  return { isRunning, run };
};
