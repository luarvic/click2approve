import { stores } from "@/app/rootStore";
import { Refresh } from "@/shared/constants/constants";
import { useEffect, useRef, useState } from "react";

type GridRefreshKey = boolean | number | string | null | undefined;

export const useGridRefresh = (
  refresh: () => void | Promise<void>,
  refreshKey: GridRefreshKey,
  loader?: string,
): boolean => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const refreshGrid = async () => {
      if (loader) {
        stores.commonStore.updateActionLoadingCounter(loader, 1);
      }
      setIsRefreshing(true);
      try {
        await refreshRef.current();
      } finally {
        if (loader) {
          stores.commonStore.updateActionLoadingCounter(loader, -1);
        }
        setIsRefreshing(false);
      }
    };

    void refreshGrid();
    if (Refresh.gridMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshGrid();
    }, Refresh.gridMs);
    return () => window.clearInterval(intervalId);
  }, [loader, refreshKey]);

  return isRefreshing || Boolean(loader && stores.commonStore.isActionLoading(loader));
};
