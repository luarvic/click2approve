import * as teamApi from "@/features/teams/api/teamApi";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import { makeAutoObservable, runInAction } from "mobx";

export class TeamStore {
  teams: Team[];

  constructor(teams: Team[] = []) {
    this.teams = teams;
    makeAutoObservable(this);
  }

  load = async (tenantId: number): Promise<void> => {
    const teams = await teamApi.listTeams(tenantId);
    runInAction(() => {
      this.teams = teams;
    });
  };

  create = async (tenantId: number, payload: UpsertTeamRequest): Promise<boolean> => {
    const team = await teamApi.createTeam(tenantId, payload);
    if (!team) {
      return false;
    }

    runInAction(() => {
      this.teams = [...this.teams, team];
    });
    return true;
  };

  update = async (
    tenantId: number,
    teamId: number,
    payload: UpsertTeamRequest
  ): Promise<boolean> => {
    const team = await teamApi.updateTeam(tenantId, teamId, payload);
    if (!team) {
      return false;
    }

    runInAction(() => {
      this.teams = this.teams.map((item) =>
        item.id === team.id ? team : item
      );
    });
    return true;
  };

  delete = async (tenantId: number, teamId: number): Promise<boolean> => {
    if (!(await teamApi.deleteTeam(tenantId, teamId))) {
      return false;
    }

    runInAction(() => {
      this.teams = this.teams.filter((team) => team.id !== teamId);
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.teams = [];
    });
  };
}
