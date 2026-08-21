import { stores } from "@/app/rootStore";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestTask from "@/features/approvalRequests/components/ApprovalRequestTask";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export type ApprovalRequestTaskTab = "task" | "request" | "chat";

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
  const detailLoader = ActionLoaders.approvalRequestTasks.load(taskGlobalId);

  useEffect(() => {
    let active = true;
    setLoadedTaskGlobalId(null);
    if (tenantGlobalId && taskGlobalId) {
      stores.commonStore.updateActionLoadingCounter(detailLoader, 1);
      void stores.approvalRequestTaskStore
        .loadDetails(tenantGlobalId, taskGlobalId)
        .then(() => {
          if (active) {
            setLoadedTaskGlobalId(taskGlobalId);
          }
        })
        .finally(() => stores.commonStore.updateActionLoadingCounter(detailLoader, -1));
    }
    return () => {
      active = false;
    };
  }, [detailLoader, taskGlobalId, tenantGlobalId]);

  useEffect(() => {
    stores.approvalRequestTaskStore.setCurrent(task ?? null);
  }, [task]);

  if (!taskGlobalId) return <Navigate to={inboxPath} />;
  if (taskHasLoaded && !task) return <NotFoundPage />;
  if (!task || !taskHasLoaded) return null;

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
