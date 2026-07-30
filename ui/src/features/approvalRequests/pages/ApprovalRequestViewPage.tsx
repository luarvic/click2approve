import { stores } from "@/app/rootStore";
import ApprovalRequestView from "@/features/approvalRequests/components/ApprovalRequestView";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestViewPage = () => {
  usePageTitle("Request");
  const navigate = useNavigate();
  const { approvalRequestGlobalId } = useParams<{ approvalRequestGlobalId: string }>();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const approvalRequest = approvalRequestGlobalId ? stores.approvalRequestStore.getDetail(approvalRequestGlobalId) : null;
  const [loadedApprovalRequestGlobalId, setLoadedApprovalRequestGlobalId] = useState<string | null>(null);
  const approvalRequestHasLoaded =
    loadedApprovalRequestGlobalId === approvalRequestGlobalId;

  useEffect(() => {
    let active = true;
    setLoadedApprovalRequestGlobalId(null);
    if (tenantGlobalId && approvalRequestGlobalId) {
      void stores.approvalRequestStore.loadDetails(tenantGlobalId, approvalRequestGlobalId).then(() => {
        if (active) {
          setLoadedApprovalRequestGlobalId(approvalRequestGlobalId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [approvalRequestGlobalId, tenantGlobalId]);

  useEffect(() => {
    stores.approvalRequestStore.setCurrent(approvalRequest ?? null);
  }, [approvalRequest]);

  if (!approvalRequestGlobalId) return <Navigate to={outboxPath} />;
  if (approvalRequestHasLoaded && !approvalRequest) return <NotFoundPage />;
  if (!approvalRequest || !approvalRequestHasLoaded) return <LoadingOverlay />;

  return <ApprovalRequestView
    onClose={(currentApprovalRequestGlobalId) =>
      navigate(outboxPath, {
        state: currentApprovalRequestGlobalId ? { currentApprovalRequestGlobalId } : undefined,
      })
    }
  />;
};

export default observer(ApprovalRequestViewPage);
