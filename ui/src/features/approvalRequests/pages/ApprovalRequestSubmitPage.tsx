import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

const ApprovalRequestSubmitPage = () => {
  usePageTitle("Compose approval request");
  const navigate = useNavigate();
  const location = useLocation();
  const initialTemplateId = (
    location.state as { templateId?: number } | null
  )?.templateId;
  const { approvalRequestId } = useParams<{ approvalRequestId: string }>();
  const parsedApprovalRequestId = Number(approvalRequestId);
  const isResubmit = approvalRequestId !== undefined;
  const tenantId = stores.tenantStore.currentTenantId;
  const outboxPath = tenantId ? Routes.tenantPath(tenantId, "/outbox") : "/";
  const [loadedApprovalRequestId, setLoadedApprovalRequestId] = useState<number | null>(null);

  useEffect(() => {
    if (!isResubmit) {
      stores.approvalRequestStore.setRequestToClone(null);
      setLoadedApprovalRequestId(null);
      return;
    }

    let active = true;
    setLoadedApprovalRequestId(null);
    if (tenantId && Number.isInteger(parsedApprovalRequestId)) {
      void stores.approvalRequestStore.loadDetails(tenantId, parsedApprovalRequestId).then((approvalRequest) => {
        if (active) {
          stores.approvalRequestStore.setRequestToClone(approvalRequest);
          setLoadedApprovalRequestId(parsedApprovalRequestId);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [isResubmit, parsedApprovalRequestId, tenantId]);

  if (isResubmit && !Number.isInteger(parsedApprovalRequestId)) {
    return <Navigate to={outboxPath} />;
  }

  if (isResubmit && loadedApprovalRequestId !== parsedApprovalRequestId) {
    return <LoadingOverlay />;
  }

  return (
    <ApprovalRequestSubmit
      initialTemplateId={initialTemplateId}
      onClose={(currentApprovalRequestId) =>
        navigate(outboxPath, {
          state: currentApprovalRequestId
            ? { currentApprovalRequestId }
            : undefined,
        })
      }
    />
  );
};

export default observer(ApprovalRequestSubmitPage);
