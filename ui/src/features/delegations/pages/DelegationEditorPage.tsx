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
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const DelegationEditorPage = () => {
  const navigate = useNavigate();
  const { delegationId } = useParams<{ delegationId: string }>();
  usePageTitle(
    delegationId === undefined ? "New delegation" : "Edit delegation",
  );
  const tenantId = stores.tenantStore.currentTenantId;
  const delegationsPath = tenantId
    ? Routes.tenantPath(tenantId, "/delegations")
    : "/";
  const isNewDelegation = delegationId === undefined;
  const parsedDelegationId = Number(delegationId);
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const [delegationsHaveLoaded, setDelegationsHaveLoaded] = useState(false);
  const delegation = delegations.find((item) => item.id === parsedDelegationId);
  const canEdit = stores.tenantStore.currentTenant?.role === EmployeeRole.Admin;

  useEffect(() => {
    setDelegations([]);
    setDelegationsHaveLoaded(false);
    stores.employeeStore.clear();
    if (!tenantId) {
      return;
    }

    void Promise.all([
      stores.employeeStore.load(tenantId, true),
      listApprovalDelegations(tenantId).then(setDelegations),
    ]).finally(() => setDelegationsHaveLoaded(true));
  }, [tenantId]);

  if (!tenantId) return <Navigate to={delegationsPath} />;
  if (!isNewDelegation && !delegation) {
    return delegationsHaveLoaded ? (
      <Navigate to={delegationsPath} />
    ) : (
      <LoadingOverlay />
    );
  }

  return (
    <DelegationEditor
      delegation={delegation ?? null}
      employees={stores.employeeStore.employees}
      canEdit={canEdit}
      onClose={(currentDelegationId) =>
        navigate(delegationsPath, {
          state: currentDelegationId ? { currentDelegationId } : undefined,
        })
      }
      onDelete={async (id) => {
        const deleted = await deleteApprovalDelegation(tenantId, id);
        if (deleted) navigate(delegationsPath);
        return deleted;
      }}
      onSubmit={(payload: ApprovalDelegationUpsert, id?: number) =>
        id
          ? updateApprovalDelegation(tenantId, id, payload)
          : createApprovalDelegation(tenantId, payload)
      }
    />
  );
};

export default observer(DelegationEditorPage);
