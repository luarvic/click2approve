import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listTeams = async (tenantGlobalId: string): Promise<Team[]> => {
  try {
    const { data } = await axios.get<Team[]>(`api/v1/tenants/${tenantGlobalId}/teams`);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createTeam = async (
  tenantGlobalId: string,
  payload: UpsertTeamRequest
): Promise<Team | null> => {
  try {
    const { data } = await axios.post<Team>(
      `api/v1/tenants/${tenantGlobalId}/teams`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateTeam = async (
  tenantGlobalId: string,
  teamGlobalId: string,
  payload: UpsertTeamRequest
): Promise<Team | null> => {
  try {
    const { data } = await axios.put<Team>(
      `api/v1/tenants/${tenantGlobalId}/teams/${teamGlobalId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteTeam = async (
  tenantGlobalId: string,
  teamGlobalId: string
): Promise<boolean> => {
  try {
    await axios.delete(`api/v1/tenants/${tenantGlobalId}/teams/${teamGlobalId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
