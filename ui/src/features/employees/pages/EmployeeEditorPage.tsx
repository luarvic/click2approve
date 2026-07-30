import { stores } from "@/app/rootStore";
import EmployeeEditor from "@/features/employees/components/EmployeeDialog";
import { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const EmployeeEditorPage = () => {
  const navigate = useNavigate();
  const { employeeGlobalId } = useParams<{ employeeGlobalId: string }>();
  usePageTitle(employeeGlobalId === undefined ? "New employee" : "Edit employee");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const employeesPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/employees")
    : "/";
  const isNewEmployee = employeeGlobalId === undefined;
  const [employeeDataHasLoaded, setEmployeeDataHasLoaded] = useState(isNewEmployee);
  const employee = stores.employeeStore.employees.find((item) => item.globalId === employeeGlobalId);
  const canEdit = stores.tenantStore.currentTenant?.role === EmployeeRole.Admin || stores.tenantStore.currentTenant?.isOwner === true;
  const selectedTeamGlobalIds = employee ? stores.teamStore.teams.filter((team) => team.members.some((member) => member.globalId === employee.globalId)).map((team) => team.globalId) : [];

  useEffect(() => {
    let active = true;
    setEmployeeDataHasLoaded(false);
    if (!tenantGlobalId) {
      return;
    }

    void Promise.all([
      stores.employeeStore.load(tenantGlobalId, true),
      stores.teamStore.load(tenantGlobalId, true),
    ]).finally(() => {
      if (active) {
        setEmployeeDataHasLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={employeesPath} />;
  if (!employeeDataHasLoaded) return <LoadingOverlay />;
  if (!isNewEmployee && !employee) return <NotFoundPage />;

  const syncTeams = async (employeeGlobalIdToSync: string, teamGlobalIds: string[]) => {
    const selected = new Set(teamGlobalIds);
    for (const team of stores.teamStore.teams) {
      const memberGlobalIds = team.members.map((member) => member.globalId);
      if (memberGlobalIds.includes(employeeGlobalIdToSync) === selected.has(team.globalId)) continue;
      const saved = await stores.teamStore.update(tenantGlobalId, team.globalId, { name: team.name, employeeGlobalIds: selected.has(team.globalId) ? [...memberGlobalIds, employeeGlobalIdToSync] : memberGlobalIds.filter( (id: string) => id !== employeeGlobalIdToSync) });
      if (!saved) return false;
    }
    await stores.teamStore.load(tenantGlobalId, true);
    return true;
  };

  return <EmployeeEditor
    employee={employee ?? null}
    teams={stores.teamStore.teams}
    selectedTeamGlobalIds={selectedTeamGlobalIds}
    canEdit={canEdit}
    onClose={(currentEmployeeGlobalId) => navigate(employeesPath, { state: currentEmployeeGlobalId ? { currentEmployeeGlobalId } : undefined })}
    onDelete={async  (id: string) => {
      const deleted = await stores.employeeStore.delete(tenantGlobalId, id);
      if (deleted) {
        showPersistenceSuccessToast(
          PersistenceSuccessMessages.employeeDeleted,
        );
        navigate(employeesPath);
      }
      return deleted;
    }}
    onSubmit={async (payload: CreateEmployeeRequest | UpdateEmployeeRequest, teamGlobalIds, id) => {
      const saved = id ? await stores.employeeStore.update(tenantGlobalId, id, payload as UpdateEmployeeRequest) : await stores.employeeStore.create(tenantGlobalId, payload as CreateEmployeeRequest);
      if (!saved || !(await syncTeams(saved.globalId, teamGlobalIds))) {
        return null;
      }
      showPersistenceSuccessToast(PersistenceSuccessMessages.employeeSaved);
      return saved;
    }}
  />;
};

export default observer(EmployeeEditorPage);
