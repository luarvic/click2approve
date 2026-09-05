import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit, {
  getCachedApprovalRequestSubmitDraft,
} from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import { TenantType } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
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
  const businessTenantIsSelected = stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees = businessTenantIsSelected && stores.applicationConfigurationStore.employeeAssigneesAreEnabled;
  const canUseTeams = businessTenantIsSelected && stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const [loadedApprovalRequestGlobalId, setLoadedApprovalRequestGlobalId] = useState<string | null>(null);
  const [templateAssigneeOptionsAreLoaded, setTemplateAssigneeOptionsAreLoaded] = useState(
    initialTemplateGlobalId === undefined,
  );

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
      const approvalRequestLoad = stores.approvalRequestStore.loadDetails(tenantGlobalId, approvalRequestGlobalId);
      const assigneeOptionsLoad = Promise.all([
        canUseEmployees ? stores.employeeStore.load(tenantGlobalId, true) : Promise.resolve(),
        canUseTeams ? stores.teamStore.load(tenantGlobalId, true) : Promise.resolve(),
      ]);

      void Promise.all([approvalRequestLoad, assigneeOptionsLoad])
        .then(([approvalRequest]) => {
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
  }, [approvalRequestGlobalId, canUseEmployees, canUseTeams, isResubmit, tenantGlobalId]);

  useEffect(() => {
    if (isResubmit || !initialTemplateGlobalId) {
      setTemplateAssigneeOptionsAreLoaded(true);
      return;
    }

    let active = true;
    const loader = ActionLoaders.pages.approvalRequestSubmit(initialTemplateGlobalId);
    setTemplateAssigneeOptionsAreLoaded(false);
    stores.commonStore.updateActionLoadingCounter(loader, 1);
    const assigneeOptionsLoad = Promise.all([
      canUseEmployees && tenantGlobalId ? stores.employeeStore.load(tenantGlobalId, true) : Promise.resolve(),
      canUseTeams && tenantGlobalId ? stores.teamStore.load(tenantGlobalId, true) : Promise.resolve(),
    ]);

    void assigneeOptionsLoad
      .then(() => {
        if (active) {
          setTemplateAssigneeOptionsAreLoaded(true);
        }
      })
      .finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));

    return () => {
      active = false;
    };
  }, [canUseEmployees, canUseTeams, initialTemplateGlobalId, isResubmit, tenantGlobalId]);

  if (isResubmit && !approvalRequestGlobalId) {
    return <Navigate to={requestsPath} />;
  }

  if (isResubmit && loadedApprovalRequestGlobalId !== approvalRequestGlobalId) {
    return null;
  }

  if (!isResubmit && !templateAssigneeOptionsAreLoaded) {
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
