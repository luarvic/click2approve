import { Refresh } from "@/shared/constants/constants";
import { useEffect, useRef } from "react";

type GridRefreshKey = boolean | number | string | null | undefined;

export const useGridRefresh = (
  refresh: () => void | Promise<void>,
  refreshKey: GridRefreshKey,
): void => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    void refreshRef.current();
    if (Refresh.gridMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshRef.current();
    }, Refresh.gridMs);
    return () => window.clearInterval(intervalId);
  }, [refreshKey]);
};
