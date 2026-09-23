import { stores } from "@/app/rootStore";
import { getAuthReturnUrl, rememberReturnUrl } from "@/features/identity/routing/returnUrl";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Shares the pending destination between password, passkey, sign-up, and confirmation flows. */
export const useAuthReturnUrl = (): string => {
  const { search } = useLocation();
  const returnUrl = getAuthReturnUrl(search);
  const user = stores.userAccountStore.currentUser;
  useEffect(() => {
    if (user === null && new URLSearchParams(search).has("returnUrl")) rememberReturnUrl(returnUrl);
  }, [returnUrl, search, user]);
  return returnUrl;
};
