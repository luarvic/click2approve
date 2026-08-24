import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit, {
  getCachedApprovalRequestSubmitDraft,
} from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestSubmitPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as {
    hasDraft?: boolean;
    templateGlobalId?: string;
  } | null;
  const initialTemplateGlobalId = navigationState?.templateGlobalId;
  const initialDraft = navigationState?.hasDraft ? getCachedApprovalRequestSubmitDraft() : undefined;
  usePageTitle("Compose request");
  const { approvalRequestGlobalId } = useParams<{
    approvalRequestGlobalId: string;
  }>();
  const isResubmit = approvalRequestGlobalId !== undefined;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const [loadedApprovalRequestGlobalId, setLoadedApprovalRequestGlobalId] = useState<string | null>(null);

  useEffect(() => {
    if (!isResubmit) {
      stores.approvalRequestStore.setRequestToClone(null);
      setLoadedApprovalRequestGlobalId(null);
      return;
    }

    let active = true;
    const loader = ActionLoaders.pages.approvalRequestSubmit(approvalRequestGlobalId);
    setLoadedApprovalRequestGlobalId(null);
    if (tenantGlobalId && approvalRequestGlobalId) {
      stores.commonStore.updateActionLoadingCounter(loader, 1);
      void stores.approvalRequestStore
        .loadDetails(tenantGlobalId, approvalRequestGlobalId)
        .then((approvalRequest) => {
          if (active) {
            stores.approvalRequestStore.setRequestToClone(approvalRequest);
            setLoadedApprovalRequestGlobalId(approvalRequestGlobalId);
          }
        })
        .finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
    }

    return () => {
      active = false;
    };
  }, [isResubmit, approvalRequestGlobalId, tenantGlobalId]);

  if (isResubmit && !approvalRequestGlobalId) {
    return <Navigate to={requestsPath} />;
  }

  if (isResubmit && loadedApprovalRequestGlobalId !== approvalRequestGlobalId) {
    return null;
  }

  return (
    <NarrowContent>
      <ApprovalRequestSubmit
        initialDraft={initialDraft ?? undefined}
        initialTemplateGlobalId={initialTemplateGlobalId}
        onClose={(currentApprovalRequestGlobalId) =>
          navigate(requestsPath, {
            state: currentApprovalRequestGlobalId ? { currentApprovalRequestGlobalId } : undefined,
          })
        }
      />
    </NarrowContent>
  );
};

export default observer(ApprovalRequestSubmitPage);
