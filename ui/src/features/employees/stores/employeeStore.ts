import * as employeeApi from "@/features/employees/api/employeesApi";
import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { makeAutoObservable, runInAction } from "mobx";

export class EmployeeStore {
  employees: Employee[];
  private loadedTenantGlobalId: string | null = null;
  private loadRequest: Promise<void> | null = null;
  private loadingTenantGlobalId: string | null = null;
  private requestVersion = 0;

  constructor(employees: Employee[] = []) {
    this.employees = employees;
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
    const request = employeeApi.listEmployees(tenantGlobalId).then((employees) => {
      if (requestVersion !== this.requestVersion) {
        return;
      }
      runInAction(() => {
        this.employees = employees;
        this.loadedTenantGlobalId = tenantGlobalId;
      });
    }).finally(() => {
      if (this.loadRequest === request) {
        this.loadRequest = null;
        this.loadingTenantGlobalId = null;
      }
    });
    this.loadRequest = request;
    this.loadingTenantGlobalId = tenantGlobalId;
    return request;
  };

  create = async (
    tenantGlobalId: string,
    payload: CreateEmployeeRequest
  ): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.createEmployee(tenantGlobalId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.employees = [...this.employees, employee];
    });
    return employee;
  };

  update = async (
    tenantGlobalId: string,
    employeeGlobalId: string,
    payload: UpdateEmployeeRequest
  ): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.updateEmployee(tenantGlobalId, employeeGlobalId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.employees = this.employees.map((item) =>
        item.globalId === employee.globalId ? employee : item
      );
    });
    return employee;
  };

  delete = async (tenantGlobalId: string, employeeGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await employeeApi.deleteEmployee(tenantGlobalId, employeeGlobalId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
      return false;
    }

    runInAction(() => {
      this.employees = this.employees.filter(
        (employee) => employee.globalId !== employeeGlobalId
      );
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.employees = [];
      this.loadedTenantGlobalId = null;
      this.loadRequest = null;
      this.loadingTenantGlobalId = null;
    });
  };
}
