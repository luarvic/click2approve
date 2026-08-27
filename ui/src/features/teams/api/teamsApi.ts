import { Team, TeamListItem, TeamPickerItem, UpsertTeamRequest } from "@/features/teams/models/team";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const listTeams = async (tenantGlobalId: string): Promise<TeamListItem[]> => {
  try {
    const { data } = await axios.get<TeamListItem[]>(ApiPaths.tenants.teams(tenantGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const listTeamPicker = async (tenantGlobalId: string): Promise<TeamPickerItem[]> => {
  try {
    const { data } = await axios.get<TeamPickerItem[]>(ApiPaths.tenants.teamsPicker(tenantGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const getTeam = async (tenantGlobalId: string, teamGlobalId: string): Promise<Team | null> => {
  try {
    const { data } = await axios.get<Team>(ApiPaths.tenants.team(tenantGlobalId, teamGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createTeam = async (tenantGlobalId: string, payload: UpsertTeamRequest): Promise<Team | null> => {
  try {
    const { data } = await axios.post<Team>(ApiPaths.tenants.teams(tenantGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateTeam = async (
  tenantGlobalId: string,
  teamGlobalId: string,
  payload: UpsertTeamRequest,
): Promise<Team | null> => {
  try {
    const { data } = await axios.put<Team>(ApiPaths.tenants.team(tenantGlobalId, teamGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteTeam = async (tenantGlobalId: string, teamGlobalId: string): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.team(tenantGlobalId, teamGlobalId));
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
