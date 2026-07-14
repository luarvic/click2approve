import { stores } from "@/app/rootStore";
import ApprovalRequestTaskEditor from "@/features/approvalRequests/components/ApprovalRequestTaskViewDialog";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestTaskEditorPage = () => {
  usePageTitle("Inbox request");
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const parsedTaskId = Number(taskId);
  const tenantId = stores.tenantStore.currentTenantId;
  const inboxPath = tenantId ? Routes.tenantPath(tenantId, "/inbox") : "/";
  const task = stores.approvalRequestTaskStore.getDetail(parsedTaskId);
  const [loadedTaskId, setLoadedTaskId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoadedTaskId(null);
    if (Number.isInteger(parsedTaskId)) {
      void stores.approvalRequestTaskStore.loadDetails(parsedTaskId).then(() => {
        if (active) {
          setLoadedTaskId(parsedTaskId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [parsedTaskId]);

  useEffect(() => {
    stores.approvalRequestTaskStore.setCurrent(task ?? null);
  }, [task]);

  if (!Number.isInteger(parsedTaskId)) return <Navigate to={inboxPath} />;
  if (!task || loadedTaskId !== parsedTaskId) return <LoadingOverlay />;

  return <ApprovalRequestTaskEditor onClose={(currentTaskId) => navigate(inboxPath, { state: currentTaskId ? { currentTaskId } : undefined })} />;
};

export default observer(ApprovalRequestTaskEditorPage);
