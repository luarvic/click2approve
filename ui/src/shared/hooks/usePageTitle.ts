import { useEffect } from "react";

export const defaultPageTitle = "Click2Approve";

export const usePageTitle = (title = defaultPageTitle) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
