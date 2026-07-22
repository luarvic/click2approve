import * as teamApi from "@/features/teams/api/teamsApi";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import { makeAutoObservable, runInAction } from "mobx";

export class TeamStore {
  teams: Team[];
  private loadedTenantId: number | null = null;
  private loadRequest: Promise<void> | null = null;
  private loadingTenantId: number | null = null;
  private requestVersion = 0;

  constructor(teams: Team[] = []) {
    this.teams = teams;
    makeAutoObservable(this);
  }

  load = (tenantId: number, refresh = false): Promise<void> => {
    if (!refresh && this.loadedTenantId === tenantId) {
      return Promise.resolve();
    }
    if (this.loadRequest && this.loadingTenantId === tenantId) {
      return this.loadRequest;
    }

    const requestVersion = ++this.requestVersion;
    const request = teamApi.listTeams(tenantId).then((teams) => {
      if (requestVersion !== this.requestVersion) {
        return;
      }
      runInAction(() => {
        this.teams = teams;
        this.loadedTenantId = tenantId;
      });
    }).finally(() => {
      if (this.loadRequest === request) {
        this.loadRequest = null;
        this.loadingTenantId = null;
      }
    });
    this.loadRequest = request;
    this.loadingTenantId = tenantId;
    return request;
  };

  create = async (tenantId: number, payload: UpsertTeamRequest): Promise<Team | null> => {
    const requestVersion = this.requestVersion;
    const team = await teamApi.createTeam(tenantId, payload);
    if (!team || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.teams = [...this.teams, team];
    });
    return team;
  };

  update = async (
    tenantId: number,
    teamId: number,
    payload: UpsertTeamRequest
  ): Promise<Team | null> => {
    const requestVersion = this.requestVersion;
    const team = await teamApi.updateTeam(tenantId, teamId, payload);
    if (!team || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.teams = this.teams.map((item) =>
        item.id === team.id ? team : item
      );
    });
    return team;
  };

  delete = async (tenantId: number, teamId: number): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await teamApi.deleteTeam(tenantId, teamId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
      return false;
    }

    runInAction(() => {
      this.teams = this.teams.filter((team) => team.id !== teamId);
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.teams = [];
      this.loadedTenantId = null;
      this.loadRequest = null;
      this.loadingTenantId = null;
    });
  };
}
