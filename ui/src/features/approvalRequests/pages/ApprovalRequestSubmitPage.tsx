import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit, {
  cacheApprovalRequestSubmitDraft,
  getCachedApprovalRequestSubmitDraft,
} from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
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
  const initialDraft = navigationState?.hasDraft
    ? getCachedApprovalRequestSubmitDraft()
    : undefined;
  const isVisibilityPage = location.pathname.endsWith("/visibility");
  usePageTitle(isVisibilityPage ? "Request visibility" : "Compose request");
  const { approvalRequestGlobalId } = useParams<{ approvalRequestGlobalId: string }>();
  const isResubmit = approvalRequestGlobalId !== undefined;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const composePath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/outbox/new/compose")
    : "/";
  const resubmitComposePath =
    tenantGlobalId && approvalRequestGlobalId
      ? Routes.tenantPath(
        tenantGlobalId,
        `/outbox/${approvalRequestGlobalId}/resubmit`,
      )
      : composePath;
  const visibilityPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/outbox/new/compose/visibility")
    : "/";
  const resubmitVisibilityPath =
    tenantGlobalId && approvalRequestGlobalId
      ? Routes.tenantPath(
        tenantGlobalId,
        `/outbox/${approvalRequestGlobalId}/resubmit/visibility`,
      )
      : visibilityPath;
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

  if (isVisibilityPage && !initialDraft) {
    return <Navigate replace to={isResubmit ? resubmitComposePath : composePath} />;
  }

  if (isResubmit && loadedApprovalRequestGlobalId !== approvalRequestGlobalId) {
    return <LoadingOverlay />;
  }

  return (
    <ApprovalRequestSubmit
      initialDraft={initialDraft ?? undefined}
      initialTemplateGlobalId={initialTemplateGlobalId}
      isVisibilityPage={isVisibilityPage}
      onClose={(currentApprovalRequestGlobalId) =>
        navigate(outboxPath, {
          state: currentApprovalRequestGlobalId
            ? { currentApprovalRequestGlobalId }
            : undefined,
        })
      }
      onComposeBreadcrumbClick={(draft) => {
        cacheApprovalRequestSubmitDraft(draft);
        navigate(isResubmit ? resubmitComposePath : composePath, {
          state: { hasDraft: true },
        });
      }}
      onShowCompose={(draft) => {
        cacheApprovalRequestSubmitDraft(draft);
        navigate(isResubmit ? resubmitComposePath : composePath, {
          state: { hasDraft: true },
        });
      }}
      onShowVisibility={(draft) => {
        cacheApprovalRequestSubmitDraft(draft);
        navigate(isResubmit ? resubmitVisibilityPath : visibilityPath, {
          state: { hasDraft: true },
        });
      }}
    />
  );
};

export default observer(ApprovalRequestSubmitPage);
