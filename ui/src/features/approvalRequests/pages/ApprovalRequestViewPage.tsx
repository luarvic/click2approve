import { stores } from "@/app/rootStore";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestView from "@/features/approvalRequests/components/ApprovalRequestView";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Refresh } from "@/shared/config/application";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export type ApprovalRequestViewTab = "request" | "chat";

interface ApprovalRequestViewPageProps {
  tab?: ApprovalRequestViewTab;
}

const ApprovalRequestViewPage: React.FC<ApprovalRequestViewPageProps> = ({ tab = "request" }) => {
  const navigate = useNavigate();
  const { approvalRequestGlobalId } = useParams<{
    approvalRequestGlobalId: string;
  }>();
  usePageTitle(`Request ${getApprovalRequestNumber(approvalRequestGlobalId)}`);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const approvalRequest = approvalRequestGlobalId
    ? stores.approvalRequestStore.getDetail(approvalRequestGlobalId)
    : null;
  const [loadedApprovalRequestGlobalId, setLoadedApprovalRequestGlobalId] = useState<string | null>(null);
  const approvalRequestHasLoaded = loadedApprovalRequestGlobalId === approvalRequestGlobalId;
  const detailLoader = ActionLoaders.approvalRequests.load(approvalRequestGlobalId);

  useEffect(() => {
    let active = true;
    setLoadedApprovalRequestGlobalId(null);
    const load = () => {
      if (!tenantGlobalId || !approvalRequestGlobalId) {
        return;
      }

      stores.commonStore.updateActionLoadingCounter(detailLoader, 1);
      void stores.approvalRequestStore
        .loadDetails(tenantGlobalId, approvalRequestGlobalId)
        .then(() => {
          if (active) {
            setLoadedApprovalRequestGlobalId(approvalRequestGlobalId);
          }
        })
        .finally(() => stores.commonStore.updateActionLoadingCounter(detailLoader, -1));
    };

    load();
    if (Refresh.approvalRequestDetailsMs <= 0) {
      return () => {
        active = false;
      };
    }

    const intervalId = window.setInterval(load, Refresh.approvalRequestDetailsMs);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [approvalRequestGlobalId, detailLoader, tenantGlobalId]);

  useEffect(() => {
    stores.approvalRequestStore.setCurrent(approvalRequest ?? null);
  }, [approvalRequest]);

  if (!approvalRequestGlobalId) return <Navigate to={requestsPath} />;
  if (approvalRequestHasLoaded && !approvalRequest) return <NotFoundPage />;
  if (!approvalRequest || !approvalRequestHasLoaded) return null;

  return (
    <NarrowContent>
      <ApprovalRequestView
        onClose={(currentApprovalRequestGlobalId) =>
          navigate(requestsPath, {
            state: currentApprovalRequestGlobalId ? { currentApprovalRequestGlobalId } : undefined,
          })
        }
        approvalRequestGlobalId={approvalRequestGlobalId}
        tab={tab}
      />
    </NarrowContent>
  );
};

export default observer(ApprovalRequestViewPage);
