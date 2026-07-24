import { stores } from "@/app/rootStore";
import ApprovalRequestView from "@/features/approvalRequests/components/ApprovalRequestView";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestViewPage = () => {
  usePageTitle("Approval request");
  const navigate = useNavigate();
  const { approvalRequestId } = useParams<{ approvalRequestId: string }>();
  const parsedApprovalRequestId = Number(approvalRequestId);
  const tenantId = stores.tenantStore.currentTenantId;
  const outboxPath = tenantId ? Routes.tenantPath(tenantId, "/outbox") : "/";
  const approvalRequest = stores.approvalRequestStore.getDetail(parsedApprovalRequestId);
  const [loadedApprovalRequestId, setLoadedApprovalRequestId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoadedApprovalRequestId(null);
    if (tenantId && Number.isInteger(parsedApprovalRequestId)) {
      void stores.approvalRequestStore.loadDetails(tenantId, parsedApprovalRequestId).then(() => {
        if (active) {
          setLoadedApprovalRequestId(parsedApprovalRequestId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [parsedApprovalRequestId, tenantId]);

  useEffect(() => {
    stores.approvalRequestStore.setCurrent(approvalRequest ?? null);
  }, [approvalRequest]);

  if (!Number.isInteger(parsedApprovalRequestId)) return <Navigate to={outboxPath} />;
  if (!approvalRequest || loadedApprovalRequestId !== parsedApprovalRequestId) return <LoadingOverlay />;

  return <ApprovalRequestView
    onClose={(currentApprovalRequestId) =>
      navigate(outboxPath, {
        state: currentApprovalRequestId ? { currentApprovalRequestId } : undefined,
      })
    }
    onClone={() => navigate(`${outboxPath}/new/compose`)}
  />;
};

export default observer(ApprovalRequestViewPage);
