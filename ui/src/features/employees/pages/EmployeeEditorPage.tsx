import { stores } from "@/app/rootStore";
import { getEmployee } from "@/features/employees/api/employeesApi";
import EmployeeEditor from "@/features/employees/components/EmployeeDialog";
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const EmployeeEditorPage = () => {
  const navigate = useNavigate();
  const { employeeGlobalId } = useParams<{ employeeGlobalId: string }>();
  usePageTitle(employeeGlobalId === undefined ? "New employee" : "Edit employee");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const employeesPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/employees") : "/";
  const isNewEmployee = employeeGlobalId === undefined;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeDataHasLoaded, setEmployeeDataHasLoaded] = useState(isNewEmployee);
  const currentEmployeeRole = stores.tenantStore.currentTenant?.currentEmployeeRole;
  const canEdit = currentEmployeeRole === EmployeeRole.Admin || currentEmployeeRole === EmployeeRole.Owner;
  const canTransferOwnership = currentEmployeeRole === EmployeeRole.Owner;
  const selectedTeamGlobalIds = employee?.teamGlobalIds ?? [];

  useEffect(() => {
    let active = true;
    const loader = ActionLoaders.pages.employeeEditor(employeeGlobalId);
    setEmployee(null);
    setEmployeeDataHasLoaded(false);
    if (!tenantGlobalId) {
      return;
    }

    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void Promise.all([
      isNewEmployee || !employeeGlobalId ? Promise.resolve(null) : getEmployee(tenantGlobalId, employeeGlobalId),
      stores.teamStore.loadPicker(tenantGlobalId),
    ])
      .then(([loadedEmployee]) => {
        if (active) {
          setEmployee(loadedEmployee);
        }
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(loader, -1);
        if (active) {
          setEmployeeDataHasLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [employeeGlobalId, isNewEmployee, tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={employeesPath} />;
  if (!employeeDataHasLoaded) return null;
  if (isNewEmployee && !canEdit) return <Navigate replace to={employeesPath} />;
  if (!isNewEmployee && !employee) return <NotFoundPage />;

  return (
    <NarrowContent>
      <EmployeeEditor
        employee={employee ?? null}
        teams={stores.teamStore.pickerTeams}
        selectedTeamGlobalIds={selectedTeamGlobalIds}
        canEdit={canEdit}
        canTransferOwnership={canTransferOwnership}
        onClose={(currentEmployeeGlobalId) =>
          navigate(employeesPath, {
            state: currentEmployeeGlobalId ? { currentEmployeeGlobalId } : undefined,
          })
        }
        onDelete={async (id: string) => {
          const deleted = await stores.employeeStore.delete(tenantGlobalId, id);
          if (deleted) {
            showPersistenceSuccessNotification(PersistenceSuccessMessages.employeeDeleted);
            navigate(employeesPath);
          }
          return deleted;
        }}
        onSubmit={async (payload: CreateEmployeeRequest | UpdateEmployeeRequest, id) => {
          const saved = id
            ? await stores.employeeStore.update(tenantGlobalId, id, payload as UpdateEmployeeRequest)
            : await stores.employeeStore.create(tenantGlobalId, payload as CreateEmployeeRequest);
          if (!saved) {
            return null;
          }
          await Promise.all([stores.teamStore.loadPicker(tenantGlobalId), stores.tenantStore.load(tenantGlobalId)]);
          setEmployee(saved);
          showPersistenceSuccessNotification(
            id ? PersistenceSuccessMessages.employeeSaved : PersistenceSuccessMessages.employeeSavedInvitationSent,
          );
          return saved;
        }}
      />
    </NarrowContent>
  );
};

export default observer(EmployeeEditorPage);
