import { stores } from "@/app/rootStore";
import { getTeam } from "@/features/teams/api/teamsApi";
import TeamEditor from "@/features/teams/components/TeamDialog";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
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

const TeamEditorPage = () => {
  const navigate = useNavigate();
  const { teamGlobalId } = useParams<{ teamGlobalId: string }>();
  usePageTitle(teamGlobalId === undefined ? "New team" : "Edit team");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const teamsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/teams") : "/";
  const isNewTeam = teamGlobalId === undefined;
  const [teamDataHasLoaded, setTeamDataHasLoaded] = useState(isNewTeam);
  const [team, setTeam] = useState<Team | null>(null);
  const canEdit =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;

  useEffect(() => {
    let active = true;
    const loader = ActionLoaders.pages.teamEditor(teamGlobalId);
    setTeamDataHasLoaded(false);
    setTeam(null);
    if (!tenantGlobalId) {
      return;
    }

    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void Promise.all([
      isNewTeam || !teamGlobalId ? Promise.resolve(null) : getTeam(tenantGlobalId, teamGlobalId),
      stores.employeeStore.loadPicker(tenantGlobalId),
    ])
      .then(([loadedTeam]) => {
        if (active) {
          setTeam(loadedTeam);
        }
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(loader, -1);
        if (active) {
          setTeamDataHasLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [isNewTeam, teamGlobalId, tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={teamsPath} />;
  if (!teamDataHasLoaded) return null;
  if (isNewTeam && !canEdit) return <Navigate replace to={teamsPath} />;
  if (!isNewTeam && !team) return <NotFoundPage />;

  return (
    <NarrowContent>
      <TeamEditor
        team={team ?? null}
        employees={stores.employeeStore.pickerEmployees}
        canEdit={canEdit}
        onClose={(currentTeamGlobalId) =>
          navigate(teamsPath, {
            state: currentTeamGlobalId ? { currentTeamGlobalId } : undefined,
          })
        }
        onDelete={async (globalId: string) => {
          const deleted = await stores.teamStore.delete(tenantGlobalId, globalId);
          if (deleted) {
            showPersistenceSuccessNotification(PersistenceSuccessMessages.teamDeleted);
            navigate(teamsPath);
          }
          return deleted;
        }}
        onSubmit={async (payload: UpsertTeamRequest, globalId?: string) => {
          const saved = globalId
            ? await stores.teamStore.update(tenantGlobalId, globalId, payload)
            : await stores.teamStore.create(tenantGlobalId, payload);
          if (saved) {
            showPersistenceSuccessNotification(PersistenceSuccessMessages.teamSaved);
          }
          return saved;
        }}
      />
    </NarrowContent>
  );
};

export default observer(TeamEditorPage);
