import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";

const ApprovalRequestSubmitPage = () => {
  usePageTitle("Compose approval request");
  const navigate = useNavigate();
  const location = useLocation();
  const initialTemplateId = (
    location.state as { templateId?: number } | null
  )?.templateId;
  const tenantId = stores.tenantStore.currentTenantId;
  const outboxPath = tenantId ? Routes.tenantPath(tenantId, "/outbox") : "/";

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
