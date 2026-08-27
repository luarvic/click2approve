import { Employee } from "@/features/employees/models/employee";

export interface TeamListItem {
  globalId: string;
  tenantGlobalId?: string;
  name: string;
  memberCount?: number;
  members?: Employee[];
}

export interface Team extends TeamListItem {
  tenantGlobalId?: string;
}

export interface TeamPickerItem extends TeamListItem {
  globalId: string;
  name: string;
}

export interface UpsertTeamRequest {
  name: string;
  employeeGlobalIds: string[];
}
