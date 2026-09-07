import { getAuthReturnUrl, rememberReturnUrl } from "@/features/identity/routing/returnUrl";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Shares the pending destination between password, passkey, sign-up, and confirmation flows. */
export const useAuthReturnUrl = (): string => {
  const { search } = useLocation();
  const returnUrl = getAuthReturnUrl(search);
  useEffect(() => {
    if (new URLSearchParams(search).has("returnUrl")) rememberReturnUrl(returnUrl);
  }, [returnUrl, search]);
  return returnUrl;
};
