import { Employee } from "@/features/employees/models/employee";

export interface Team {
  globalId: string;
  tenantGlobalId: string;
  name: string;
  members: Employee[];
}

export interface UpsertTeamRequest {
  name: string;
  employeeGlobalIds: string[];
}
