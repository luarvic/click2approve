import { stores } from "@/app/rootStore";
import TeamEditor from "@/features/teams/components/TeamDialog";
import { UpsertTeamRequest } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
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

const TeamEditorPage = () => {
  const navigate = useNavigate();
  const { teamGlobalId } = useParams<{ teamGlobalId: string }>();
  usePageTitle(teamGlobalId === undefined ? "New team" : "Edit team");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const teamsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/teams") : "/";
  const isNewTeam = teamGlobalId === undefined;
  const [teamDataHasLoaded, setTeamDataHasLoaded] = useState(isNewTeam);
  const team = stores.teamStore.teams.find((item) => item.globalId === teamGlobalId);
  const canEdit = stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin || stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;

  useEffect(() => {
    let active = true;
    setTeamDataHasLoaded(false);
    if (!tenantGlobalId) {
      return;
    }

    void Promise.all([
      stores.teamStore.load(tenantGlobalId, true),
      stores.employeeStore.load(tenantGlobalId, true),
    ]).finally(() => {
      if (active) {
        setTeamDataHasLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [tenantGlobalId]);

  if (!tenantGlobalId) return <Navigate to={teamsPath} />;
  if (!teamDataHasLoaded) return <LoadingOverlay />;
  if (!isNewTeam && !team) return <NotFoundPage />;

  return <NarrowContent>
    <TeamEditor
      team={team ?? null}
      employees={stores.employeeStore.employees}
      canEdit={canEdit}
      onClose={(currentTeamGlobalId) => navigate(teamsPath, { state: currentTeamGlobalId ? { currentTeamGlobalId } : undefined })}
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
      }} />
  </NarrowContent>;
};

export default observer(TeamEditorPage);
