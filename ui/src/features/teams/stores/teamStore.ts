import * as teamApi from "@/features/teams/api/teamsApi";
import { Team, TeamListItem, TeamPickerItem, UpsertTeamRequest } from "@/features/teams/models/team";
import { makeAutoObservable, runInAction } from "mobx";

export class TeamStore {
  teams: TeamListItem[];
  pickerTeams: TeamPickerItem[] = [];
  private loadedTenantGlobalId: string | null = null;
  private loadRequest: Promise<void> | null = null;
  private loadingTenantGlobalId: string | null = null;
  private requestVersion = 0;

  constructor(teams: TeamListItem[] = []) {
    this.teams = teams;
    makeAutoObservable(this);
  }

  load = (tenantGlobalId: string, refresh = false): Promise<void> => {
    if (!refresh && this.loadedTenantGlobalId === tenantGlobalId) {
      return Promise.resolve();
    }
    if (this.loadRequest && this.loadingTenantGlobalId === tenantGlobalId) {
      return this.loadRequest;
    }

    const requestVersion = ++this.requestVersion;
    const request = teamApi
      .listTeams(tenantGlobalId)
      .then((teams) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        runInAction(() => {
          this.teams = teams;
          this.loadedTenantGlobalId = tenantGlobalId;
        });
      })
      .finally(() => {
        if (this.loadRequest === request) {
          this.loadRequest = null;
          this.loadingTenantGlobalId = null;
        }
      });
    this.loadRequest = request;
    this.loadingTenantGlobalId = tenantGlobalId;
    return request;
  };

  loadPicker = async (tenantGlobalId: string): Promise<void> => {
    const teams = await teamApi.listTeamPicker(tenantGlobalId);
    runInAction(() => {
      this.pickerTeams = teams;
    });
  };

  create = async (tenantGlobalId: string, payload: UpsertTeamRequest): Promise<Team | null> => {
    const requestVersion = this.requestVersion;
    const team = await teamApi.createTeam(tenantGlobalId, payload);
    if (!team || requestVersion !== this.requestVersion) {
      return null;
    }

    await this.load(tenantGlobalId, true);
    return team;
  };

  update = async (tenantGlobalId: string, teamGlobalId: string, payload: UpsertTeamRequest): Promise<Team | null> => {
    const requestVersion = this.requestVersion;
    const team = await teamApi.updateTeam(tenantGlobalId, teamGlobalId, payload);
    if (!team || requestVersion !== this.requestVersion) {
      return null;
    }

    await this.load(tenantGlobalId, true);
    return team;
  };

  delete = async (tenantGlobalId: string, teamGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await teamApi.deleteTeam(tenantGlobalId, teamGlobalId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
      return false;
    }

    runInAction(() => {
      this.teams = this.teams.filter((team) => team.globalId !== teamGlobalId);
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.teams = [];
      this.pickerTeams = [];
      this.loadedTenantGlobalId = null;
      this.loadRequest = null;
      this.loadingTenantGlobalId = null;
    });
  };
}
