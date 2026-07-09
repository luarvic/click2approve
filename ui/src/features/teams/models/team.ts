import { Employee } from "@/features/employees/models/employee";

export interface Team {
  id: number;
  tenantId: number;
  name: string;
  members: Employee[];
}

export interface UpsertTeamRequest {
  name: string;
  employeeIds: number[];
}
