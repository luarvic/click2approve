import { stores } from "@/app/rootStore";
import EmployeeEditor from "@/features/employees/components/EmployeeDialog";
import { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/features/employees/models/employee";
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

const EmployeeEditorPage = () => {
  const navigate = useNavigate();
  const { employeeGlobalId } = useParams<{ employeeGlobalId: string }>();
  usePageTitle(employeeGlobalId === undefined ? "New employee" : "Edit employee");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const employeesPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/employees") : "/";
  const isNewEmployee = employeeGlobalId === undefined;
  const [employeeDataHasLoaded, setEmployeeDataHasLoaded] = useState(isNewEmployee);
  const employee = stores.employeeStore.employees.find((item) => item.globalId === employeeGlobalId);
  const currentEmployeeRole = stores.tenantStore.currentTenant?.currentEmployeeRole;
  const canEdit = currentEmployeeRole === EmployeeRole.Admin || currentEmployeeRole === EmployeeRole.Owner;
  const canTransferOwnership = currentEmployeeRole === EmployeeRole.Owner;
  const selectedTeamGlobalIds = employee
    ? stores.teamStore.teams
        .filter((team) => team.members.some((member) => member.globalId === employee.globalId))
        .map((team) => team.globalId)
    : [];

  useEffect(() => {
    let active = true;
    const loader = ActionLoaders.pages.employeeEditor(employeeGlobalId);
    setEmployeeDataHasLoaded(false);
    if (!tenantGlobalId) {
      return;
    }

    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void Promise.all([
      stores.employeeStore.load(tenantGlobalId, true),
      stores.teamStore.load(tenantGlobalId, true),
    ]).finally(() => {
      stores.commonStore.updateActionLoadingCounter(loader, -1);
      if (active) {
        setEmployeeDataHasLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [employeeGlobalId, tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={employeesPath} />;
  if (!employeeDataHasLoaded) return null;
  if (isNewEmployee && !canEdit) return <Navigate replace to={employeesPath} />;
  if (!isNewEmployee && !employee) return <NotFoundPage />;

  return (
    <NarrowContent>
      <EmployeeEditor
        employee={employee ?? null}
        teams={stores.teamStore.teams}
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
          await Promise.all([
            stores.employeeStore.load(tenantGlobalId, true),
            stores.teamStore.load(tenantGlobalId, true),
            stores.tenantStore.load(tenantGlobalId),
          ]);
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
