import { Employee } from "@/features/employees/models/employee";

export const getEmployeeDisplayName = (employee: Employee): string => {
  const name = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  const title = employee.position?.trim();
  const identity = title ? [name, title].filter(Boolean).join(" — ") : name;
  return identity ? `${identity} (${employee.email})` : employee.email;
};
