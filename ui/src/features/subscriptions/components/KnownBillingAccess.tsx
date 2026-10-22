import { stores } from "@/app/rootStore";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

/** Redirects known-blocked tenants before rendering a page; makes no API requests. */
const KnownBillingAccess = ({ children }: { children: ReactNode }) => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const { pathname } = useLocation();
  const plansPath = `/tenants/${tenantGlobalId}/plans`;
  if (
    tenantGlobalId &&
    pathname.replace(/\/$/, "") !== plansPath &&
    stores.billingAccessStore.isBlocked(tenantGlobalId)
  ) {
    return <Navigate to={plansPath} replace />;
  }
  return <>{children}</>;
};

export default observer(KnownBillingAccess);
