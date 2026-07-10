import * as employeeApi from "@/features/employees/api/employeeApi";
import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { makeAutoObservable, runInAction } from "mobx";

export class EmployeeStore {
  employees: Employee[];
  // Incremented to invalidate older async requests so only the latest response updates the store.
  private requestVersion = 0;

  constructor(employees: Employee[] = []) {
    this.employees = employees;
    makeAutoObservable(this);
  }

  load = async (tenantId: number): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const employees = await employeeApi.listEmployees(tenantId);
    if (requestVersion !== this.requestVersion) {
      return;
    }
    runInAction(() => {
      this.employees = employees;
    });
  };

  create = async (
    tenantId: number,
    payload: CreateEmployeeRequest
  ): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.createEmployee(tenantId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.employees = [...this.employees, employee];
    });
    return employee;
  };

  update = async (
    tenantId: number,
    employeeId: number,
    payload: UpdateEmployeeRequest
  ): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.updateEmployee(tenantId, employeeId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.employees = this.employees.map((item) =>
        item.id === employee.id ? employee : item
      );
    });
    return employee;
  };

  delete = async (tenantId: number, employeeId: number): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await employeeApi.deleteEmployee(tenantId, employeeId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
      return false;
    }

    runInAction(() => {
      this.employees = this.employees.filter(
        (employee) => employee.id !== employeeId
      );
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.employees = [];
    });
  };
}
