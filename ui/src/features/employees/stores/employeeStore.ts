import * as employeeApi from "@/features/employees/api/employeesApi";
import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { makeAutoObservable, runInAction } from "mobx";

export class EmployeeStore {
  employees: Employee[];
  private loadedTenantId: number | null = null;
  private loadRequest: Promise<void> | null = null;
  private loadingTenantId: number | null = null;
  private requestVersion = 0;

  constructor(employees: Employee[] = []) {
    this.employees = employees;
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
    const request = employeeApi.listEmployees(tenantId).then((employees) => {
      if (requestVersion !== this.requestVersion) {
        return;
      }
      runInAction(() => {
        this.employees = employees;
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
      this.loadedTenantId = null;
      this.loadRequest = null;
      this.loadingTenantId = null;
    });
  };
}
