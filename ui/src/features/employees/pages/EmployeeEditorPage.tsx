import { stores } from "@/app/rootStore";
import EmployeeEditor from "@/features/employees/components/EmployeeDialog";
import { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const EmployeeEditorPage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  usePageTitle(employeeId === undefined ? "New employee" : "Edit employee");
  const tenantId = stores.tenantStore.currentTenantId;
  const employeesPath = tenantId
    ? Routes.tenantPath(tenantId, "/employees")
    : "/";
  const isNewEmployee = employeeId === undefined;
  const parsedEmployeeId = Number(employeeId);
  const employee = stores.employeeStore.employees.find((item) => item.id === parsedEmployeeId);
  const canEdit = stores.tenantStore.currentTenant?.role === EmployeeRole.Admin || stores.tenantStore.currentTenant?.isOwner === true;
  const selectedTeamIds = employee ? stores.teamStore.teams.filter((team) => team.members.some((member) => member.id === employee.id)).map((team) => team.id) : [];

  if (!tenantId || (!isNewEmployee && !employee)) return <Navigate to={employeesPath} />;

  const syncTeams = async (employeeIdToSync: number, teamIds: number[]) => {
    const selected = new Set(teamIds);
    for (const team of stores.teamStore.teams) {
      const memberIds = team.members.map((member) => member.id);
      if (memberIds.includes(employeeIdToSync) === selected.has(team.id)) continue;
      const saved = await stores.teamStore.update(tenantId, team.id, { name: team.name, employeeIds: selected.has(team.id) ? [...memberIds, employeeIdToSync] : memberIds.filter((id) => id !== employeeIdToSync) });
      if (!saved) return false;
    }
    await stores.teamStore.load(tenantId, true);
    return true;
  };

  return <EmployeeEditor
    employee={employee ?? null}
    teams={stores.teamStore.teams}
    selectedTeamIds={selectedTeamIds}
    canEdit={canEdit}
    onClose={(currentEmployeeId) => navigate(employeesPath, { state: currentEmployeeId ? { currentEmployeeId } : undefined })}
    onDelete={async (id) => {
      const deleted = await stores.employeeStore.delete(tenantId, id);
      if (deleted) navigate(employeesPath);
      return deleted;
    }}
    onSubmit={async (payload: CreateEmployeeRequest | UpdateEmployeeRequest, teamIds, id) => {
      const saved = id ? await stores.employeeStore.update(tenantId, id, payload as UpdateEmployeeRequest) : await stores.employeeStore.create(tenantId, payload as CreateEmployeeRequest);
      return saved && await syncTeams(saved.id, teamIds) ? saved : null;
    }}
  />;
};

export default observer(EmployeeEditorPage);
