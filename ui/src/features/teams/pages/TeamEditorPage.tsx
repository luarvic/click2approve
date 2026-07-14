import { stores } from "@/app/rootStore";
import TeamEditor from "@/features/teams/components/TeamDialog";
import { UpsertTeamRequest } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const TeamEditorPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  usePageTitle(teamId === undefined ? "New team" : "Edit team");
  const tenantId = stores.tenantStore.currentTenantId;
  const teamsPath = tenantId ? Routes.tenantPath(tenantId, "/teams") : "/";
  const isNewTeam = teamId === undefined;
  const parsedTeamId = Number(teamId);
  const team = stores.teamStore.teams.find((item) => item.id === parsedTeamId);
  const canEdit = stores.tenantStore.currentTenant?.role === EmployeeRole.Admin || stores.tenantStore.currentTenant?.isOwner === true;

  if (!tenantId) return <Navigate to={teamsPath} />;
  if (!isNewTeam && !team) return <LoadingOverlay />;

  return <TeamEditor
    team={team ?? null}
    employees={stores.employeeStore.employees}
    canEdit={canEdit}
    onClose={(currentTeamId) => navigate(teamsPath, { state: currentTeamId ? { currentTeamId } : undefined })}
    onDelete={async (id) => {
      const deleted = await stores.teamStore.delete(tenantId, id);
      if (deleted) navigate(teamsPath);
      return deleted;
    }}
    onSubmit={(payload: UpsertTeamRequest, id?: number) => id ? stores.teamStore.update(tenantId, id, payload) : stores.teamStore.create(tenantId, payload)}
  />;
};

export default observer(TeamEditorPage);
