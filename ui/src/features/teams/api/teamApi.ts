import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listTeams = async (tenantId: number): Promise<Team[]> => {
  try {
    const { data } = await axios.get<Team[]>(`api/tenants/${tenantId}/teams`);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createTeam = async (
  tenantId: number,
  payload: UpsertTeamRequest
): Promise<Team | null> => {
  try {
    const { data } = await axios.post<Team>(
      `api/tenants/${tenantId}/teams`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateTeam = async (
  tenantId: number,
  teamId: number,
  payload: UpsertTeamRequest
): Promise<Team | null> => {
  try {
    const { data } = await axios.put<Team>(
      `api/tenants/${tenantId}/teams/${teamId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteTeam = async (
  tenantId: number,
  teamId: number
): Promise<boolean> => {
  try {
    await axios.delete(`api/tenants/${tenantId}/teams/${teamId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
