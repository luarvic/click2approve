import { stores } from "@/app/rootStore";
import ApprovalRequestEditor from "@/features/approvalRequests/components/ApprovalRequestViewDialog";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestEditorPage = () => {
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
    if (Number.isInteger(parsedApprovalRequestId)) {
      void stores.approvalRequestStore.loadDetails(parsedApprovalRequestId).then(() => {
        if (active) {
          setLoadedApprovalRequestId(parsedApprovalRequestId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [parsedApprovalRequestId]);

  useEffect(() => {
    stores.approvalRequestStore.setCurrent(approvalRequest ?? null);
  }, [approvalRequest]);

  if (!Number.isInteger(parsedApprovalRequestId)) return <Navigate to={outboxPath} />;
  if (!approvalRequest || loadedApprovalRequestId !== parsedApprovalRequestId) return <LoadingOverlay />;

  return <ApprovalRequestEditor
    onClose={(currentApprovalRequestId) =>
      navigate(outboxPath, {
        state: currentApprovalRequestId ? { currentApprovalRequestId } : undefined,
      })
    }
    onClone={() => navigate(`${outboxPath}/new/compose`)}
  />;
};

export default observer(ApprovalRequestEditorPage);
