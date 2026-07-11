import { stores } from "@/app/rootStore";
import ApprovalRequestEditor from "@/features/approvalRequests/components/ApprovalRequestViewDialog";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestEditorPage = () => {
  const navigate = useNavigate();
  const { approvalRequestId } = useParams<{ approvalRequestId: string }>();
  const parsedApprovalRequestId = Number(approvalRequestId);
  const tenantId = stores.tenantStore.currentTenantId;
  const outboxPath = tenantId ? Routes.tenantPath(tenantId, "/outbox") : "/";
  const approvalRequest = stores.approvalRequestStore.approvalRequests.find((item) => item.id === parsedApprovalRequestId);

  useEffect(() => {
    stores.approvalRequestStore.load();
  }, []);

  useEffect(() => {
    stores.approvalRequestStore.setCurrent(approvalRequest ?? null);
  }, [approvalRequest]);

  if (!stores.userAccountStore.currentUser) return <Navigate to="/signIn" />;
  if (!Number.isInteger(parsedApprovalRequestId)) return <Navigate to={outboxPath} />;
  if (!approvalRequest) return <LoadingOverlay />;

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
