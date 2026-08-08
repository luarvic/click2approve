import { stores } from "@/app/rootStore";
import {
  createApprovalDelegation,
  deleteApprovalDelegation,
  listApprovalDelegations,
  updateApprovalDelegation,
} from "@/features/delegations/api/approvalDelegationsApi";
import DelegationEditor from "@/features/delegations/components/DelegationDialog";
import {
  ApprovalDelegation,
  ApprovalDelegationUpsert,
} from "@/features/delegations/models/approvalDelegation";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
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
  usePageTitle(
    delegationGlobalId === undefined ? "New delegation" : "Edit delegation",
  );
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/delegations")
    : "/";
  const isNewDelegation = delegationGlobalId === undefined;
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const [delegationsHaveLoaded, setDelegationsHaveLoaded] = useState(false);
  const delegation = delegations.find((item) => item.globalId === delegationGlobalId);
  const canEdit = stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin;

  useEffect(() => {
    setDelegations([]);
    setDelegationsHaveLoaded(false);
    stores.employeeStore.clear();
    if (!tenantGlobalId) {
      return;
    }

    void Promise.all([
      stores.employeeStore.load(tenantGlobalId, true),
      listApprovalDelegations(tenantGlobalId).then(setDelegations),
    ]).finally(() => setDelegationsHaveLoaded(true));
  }, [tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={delegationsPath} />;
  if (!isNewDelegation && !delegation) {
    return delegationsHaveLoaded ? (
      <NotFoundPage />
    ) : (
      <LoadingOverlay />
    );
  }

  return (
    <DelegationEditor
      delegation={delegation ?? null}
      employees={stores.employeeStore.employees}
      canEdit={canEdit}
      onClose={(currentDelegationGlobalId) =>
        navigate(delegationsPath, {
          state: currentDelegationGlobalId ? { currentDelegationGlobalId } : undefined,
        })
      }
      onDelete={async  (id: string) => {
        const deleted = await deleteApprovalDelegation(tenantGlobalId, id);
        if (deleted) {
          showPersistenceSuccessNotification(
            PersistenceSuccessMessages.delegationDeleted,
          );
          navigate(delegationsPath);
        }
        return deleted;
      }}
      onSubmit={async (payload: ApprovalDelegationUpsert, globalId?: string) => {
        const saved = globalId
          ? await updateApprovalDelegation(tenantGlobalId, globalId, payload)
          : await createApprovalDelegation(tenantGlobalId, payload);
        if (saved) {
          showPersistenceSuccessNotification(
            PersistenceSuccessMessages.delegationSaved,
          );
        }
        return saved;
      }}
    />
  );
};

export default observer(DelegationEditorPage);
