import { stores } from "@/app/rootStore";
import {
  createApprovalDelegation,
  deleteApprovalDelegation,
  getApprovalDelegation,
  updateApprovalDelegation,
} from "@/features/delegations/api/approvalDelegationsApi";
import DelegationEditor from "@/features/delegations/components/DelegationDialog";
import { ApprovalDelegation, ApprovalDelegationUpsert } from "@/features/delegations/models/approvalDelegation";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const DelegationEditorPage = () => {
  const navigate = useNavigate();
  const { delegationGlobalId } = useParams<{ delegationGlobalId: string }>();
  usePageTitle(delegationGlobalId === undefined ? "New delegation" : "Edit delegation");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/delegations") : "/";
  const isNewDelegation = delegationGlobalId === undefined;
  const [delegation, setDelegation] = useState<ApprovalDelegation | null>(null);
  const [delegationHasLoaded, setDelegationHasLoaded] = useState(false);
  const canEdit =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;

  useEffect(() => {
    const loader = ActionLoaders.pages.delegationEditor(delegationGlobalId);
    setDelegation(null);
    setDelegationHasLoaded(false);
    stores.employeeStore.clear();
    if (!tenantGlobalId) {
      return;
    }

    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void Promise.all([
      stores.employeeStore.loadPicker(tenantGlobalId),
      isNewDelegation || !delegationGlobalId
        ? Promise.resolve(null)
        : getApprovalDelegation(tenantGlobalId, delegationGlobalId),
    ])
      .then(([, loadedDelegation]) => {
        setDelegation(loadedDelegation);
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(loader, -1);
        setDelegationHasLoaded(true);
      });
  }, [delegationGlobalId, isNewDelegation, tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={delegationsPath} />;
  if (!delegationHasLoaded) return null;
  if (!isNewDelegation && !delegation) {
    return <NotFoundPage />;
  }

  return (
    <NarrowContent>
      <DelegationEditor
        delegation={delegation ?? null}
        employees={stores.employeeStore.pickerEmployees}
        canEdit={canEdit}
        onClose={(currentDelegationGlobalId) =>
          navigate(delegationsPath, {
            state: currentDelegationGlobalId ? { currentDelegationGlobalId } : undefined,
          })
        }
        onDelete={async (id: string) => {
          const deleted = await deleteApprovalDelegation(tenantGlobalId, id);
          if (deleted) {
            await stores.tenantStore.load();
            await stores.refreshTenantScope();
            showPersistenceSuccessNotification(PersistenceSuccessMessages.delegationDeleted);
            navigate(delegationsPath);
          }
          return deleted;
        }}
        onSubmit={async (payload: ApprovalDelegationUpsert, globalId?: string) => {
          const saved = globalId
            ? await updateApprovalDelegation(tenantGlobalId, globalId, payload)
            : await createApprovalDelegation(tenantGlobalId, payload);
          if (saved) {
            await stores.tenantStore.load();
            await stores.refreshTenantScope();
            showPersistenceSuccessNotification(PersistenceSuccessMessages.delegationSaved);
          }
          return saved;
        }}
      />
    </NarrowContent>
  );
};

export default observer(DelegationEditorPage);
