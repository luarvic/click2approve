import { Employee } from "@/features/employees/models/employee";

export const getEmployeeDisplayName = (employee: Employee): string => {
  const name = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  const identity = [name, employee.position].filter(Boolean).join(", ");
  return identity ? `${identity} (${employee.email})` : employee.email;
};
