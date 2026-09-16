import * as employeeApi from "@/features/employees/api/employeesApi";
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeListItem,
  EmployeePickerItem,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { makeAutoObservable, runInAction } from "mobx";

export class EmployeeStore {
  employees: EmployeeListItem[];
  pickerEmployees: EmployeePickerItem[] = [];
  pickerTenantGlobalId: string | null = null;
  isPickerLoading = false;
  private loadedTenantGlobalId: string | null = null;
  private loadRequest: Promise<void> | null = null;
  private loadingTenantGlobalId: string | null = null;
  private pickerRequestVersion = 0;
  private requestVersion = 0;

  constructor(employees: EmployeeListItem[] = []) {
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
    const request = employeeApi
      .listEmployees(tenantGlobalId)
      .then((employees) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        runInAction(() => {
          this.employees = employees;
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
    const requestVersion = ++this.pickerRequestVersion;
    runInAction(() => {
      this.isPickerLoading = true;
    });
    try {
      const employees = await employeeApi.listEmployeePicker(tenantGlobalId);
      if (requestVersion !== this.pickerRequestVersion) {
        return;
      }
      runInAction(() => {
        this.pickerEmployees = employees;
        this.pickerTenantGlobalId = tenantGlobalId;
      });
    } finally {
      if (requestVersion === this.pickerRequestVersion) {
        runInAction(() => {
          this.isPickerLoading = false;
        });
      }
    }
  };

  create = async (tenantGlobalId: string, payload: CreateEmployeeRequest): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.createEmployee(tenantGlobalId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    await this.load(tenantGlobalId, true);
    return employee;
  };

  update = async (
    tenantGlobalId: string,
    employeeGlobalId: string,
    payload: UpdateEmployeeRequest,
  ): Promise<Employee | null> => {
    const requestVersion = this.requestVersion;
    const employee = await employeeApi.updateEmployee(tenantGlobalId, employeeGlobalId, payload);
    if (!employee || requestVersion !== this.requestVersion) {
      return null;
    }

    await this.load(tenantGlobalId, true);
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
      this.employees = this.employees.filter((employee) => employee.globalId !== employeeGlobalId);
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.employees = [];
      this.pickerEmployees = [];
      this.pickerTenantGlobalId = null;
      this.isPickerLoading = false;
      this.loadedTenantGlobalId = null;
      this.loadRequest = null;
      this.loadingTenantGlobalId = null;
      this.pickerRequestVersion += 1;
    });
  };
}
