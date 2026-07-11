import { stores } from "@/app/rootStore";
import ApprovalRequestTaskEditor from "@/features/approvalRequests/components/ApprovalRequestTaskViewDialog";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestTaskEditorPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const parsedTaskId = Number(taskId);
  const tenantId = stores.tenantStore.currentTenantId;
  const inboxPath = tenantId ? Routes.tenantPath(tenantId, "/inbox") : "/";
  const task = stores.approvalRequestTaskStore.tasks.find((item) => item.id === parsedTaskId);

  useEffect(() => {
    stores.approvalRequestTaskStore.loadIncoming();
  }, []);

  useEffect(() => {
    stores.approvalRequestTaskStore.setCurrent(task ?? null);
  }, [task]);

  if (!stores.userAccountStore.currentUser) return <Navigate to="/signIn" />;
  if (!Number.isInteger(parsedTaskId)) return <Navigate to={inboxPath} />;
  if (!task) return <LoadingOverlay />;

  return <ApprovalRequestTaskEditor onClose={(currentTaskId) => navigate(inboxPath, { state: currentTaskId ? { currentTaskId } : undefined })} />;
};

export default observer(ApprovalRequestTaskEditorPage);
