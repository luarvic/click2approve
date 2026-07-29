import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestSubmitPage = () => {
  usePageTitle("Compose request");
  const navigate = useNavigate();
  const location = useLocation();
  const initialTemplateGlobalId = (
    location.state as { templateGlobalId?: string } | null
  )?.templateGlobalId;
  const { approvalRequestGlobalId } = useParams<{ approvalRequestGlobalId: string }>();
  const isResubmit = approvalRequestGlobalId !== undefined;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const [loadedApprovalRequestGlobalId, setLoadedApprovalRequestGlobalId] = useState<string | null>(null);

  useEffect(() => {
    if (!isResubmit) {
      stores.approvalRequestStore.setRequestToClone(null);
      setLoadedApprovalRequestGlobalId(null);
      return;
    }

    let active = true;
    setLoadedApprovalRequestGlobalId(null);
    if (tenantGlobalId && approvalRequestGlobalId) {
      void stores.approvalRequestStore.loadDetails(tenantGlobalId, approvalRequestGlobalId).then((approvalRequest) => {
        if (active) {
          stores.approvalRequestStore.setRequestToClone(approvalRequest);
          setLoadedApprovalRequestGlobalId(approvalRequestGlobalId);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [isResubmit, approvalRequestGlobalId, tenantGlobalId]);

  if (isResubmit && !approvalRequestGlobalId) {
    return <Navigate to={outboxPath} />;
  }

  if (isResubmit && loadedApprovalRequestGlobalId !== approvalRequestGlobalId) {
    return <LoadingOverlay />;
  }

  return (
    <ApprovalRequestSubmit
      initialTemplateGlobalId={initialTemplateGlobalId}
      onClose={(currentApprovalRequestGlobalId) =>
        navigate(outboxPath, {
          state: currentApprovalRequestGlobalId
            ? { currentApprovalRequestGlobalId }
            : undefined,
        })
      }
    />
  );
};

export default observer(ApprovalRequestSubmitPage);
