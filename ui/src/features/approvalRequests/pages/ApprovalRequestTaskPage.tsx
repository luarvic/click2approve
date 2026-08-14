import { stores } from "@/app/rootStore";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestTask from "@/features/approvalRequests/components/ApprovalRequestTask";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export type ApprovalRequestTaskTab = "task" | "request" | "chat" | "link";

interface ApprovalRequestTaskPageProps {
  tab?: ApprovalRequestTaskTab;
}

const ApprovalRequestTaskPage: React.FC<ApprovalRequestTaskPageProps> = ({ tab = "task" }) => {
  const navigate = useNavigate();
  const { taskGlobalId } = useParams<{ taskGlobalId: string }>();
  usePageTitle(`Task ${getApprovalRequestNumber(taskGlobalId)}`);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const inboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/inbox") : "/";
  const task = taskGlobalId ? stores.approvalRequestTaskStore.getDetail(taskGlobalId) : null;
  const [loadedTaskGlobalId, setLoadedTaskGlobalId] = useState<string | null>(null);
  const taskHasLoaded = loadedTaskGlobalId === taskGlobalId;

  useEffect(() => {
    let active = true;
    setLoadedTaskGlobalId(null);
    if (tenantGlobalId && taskGlobalId) {
      void stores.approvalRequestTaskStore.loadDetails(tenantGlobalId, taskGlobalId).then(() => {
        if (active) {
          setLoadedTaskGlobalId(taskGlobalId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [taskGlobalId, tenantGlobalId]);

  useEffect(() => {
    stores.approvalRequestTaskStore.setCurrent(task ?? null);
  }, [task]);

  if (!taskGlobalId) return <Navigate to={inboxPath} />;
  if (taskHasLoaded && !task) return <NotFoundPage />;
  if (!task || !taskHasLoaded) return <LoadingOverlay />;

  return (
    <NarrowContent>
      <ApprovalRequestTask
        onClose={(currentTaskGlobalId) =>
          navigate(inboxPath, {
            state: currentTaskGlobalId ? { currentTaskGlobalId } : undefined,
          })
        }
        tab={tab}
        taskGlobalId={taskGlobalId}
      />
    </NarrowContent>
  );
};

export default observer(ApprovalRequestTaskPage);
