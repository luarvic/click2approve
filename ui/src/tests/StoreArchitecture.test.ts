import { stores } from "@/app/rootStore";
import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestApi";
import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTaskApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalRequestStore } from "@/features/approvalRequests/stores/approvalRequestStore";
import { ApprovalRequestTaskStore } from "@/features/approvalRequests/stores/approvalRequestTaskStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import * as employeeApi from "@/features/employees/api/employeeApi";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeStore } from "@/features/employees/stores/employeeStore";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import { CommonStore } from "@/shared/stores/commonStore";
import { autorun, runInAction } from "mobx";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/features/approvalRequests/api/approvalRequestApi", () => ({
  listApprovalRequests: vi.fn(),
}));

vi.mock("@/features/approvalRequests/api/approvalRequestTaskApi", () => ({
  countUncompletedApprovalRequestTasks: vi.fn(),
  listApprovalRequestTasks: vi.fn(),
}));

vi.mock("@/features/employees/api/employeeApi", () => ({
  listEmployees: vi.fn(),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
};

const employee = (id: number, tenantId: number): Employee => ({
  id,
  tenantId,
  email: `employee-${id}@example.com`,
  role: EmployeeRole.User,
  status: EmployeeStatus.Active,
});

const approvalRequest = (id: number): ApprovalRequest => ({
  id,
  title: `Request ${id}`,
  userFiles: [],
  steps: [],
  createdAt: "2026-01-01T00:00:00",
  createdAtDate: new Date(),
  authorUserId: "user-id",
  authorEmail: "user@example.com",
  status: ApprovalRequestStatus.Submitted,
  tasks: [],
});

const approvalRequestTask = (
  id: number,
  status: ApprovalRequestTaskStatus,
): ApprovalRequestTask => ({
  id,
  title: `Task ${id}`,
  approvalRequest: approvalRequest(id),
  approvalRequestId: id,
  approvalRequestStepId: id,
  approverEmail: "approver@example.com",
  canViewRequest: true,
  status,
  createdAt: "2026-01-01T00:00:00",
  createdAtDate: new Date(),
});

describe("store architecture", () => {
  test("unrelated requests do not invalidate a feature loading subscription", () => {
    const store = new CommonStore();
    let reactions = 0;
    const dispose = autorun(() => {
      store.isLoadingByPrefix("put_api/tenants/1/users/");
      reactions += 1;
    });

    store.updateLoadingCounter("get_api/task/countUncompleted", 1);
    store.updateLoadingCounter("get_api/task/countUncompleted", -1);

    expect(reactions).toBe(1);
    expect(store.loadingCounter).toEqual({});
    expect(store.loadingPrefixCounter).toEqual({});
    dispose();
  });

  test("loading counters support concurrent requests and remove completed entries", () => {
    const store = new CommonStore();
    const loader = "get_api/tenants/1/users";

    store.updateLoadingCounter(loader, 1);
    store.updateLoadingCounter(loader, 1);
    store.updateLoadingCounter(loader, -1);

    expect(store.isLoading(loader)).toBe(true);
    store.updateLoadingCounter(loader, -1);
    expect(store.isLoading(loader)).toBe(false);
    expect(store.loadingCounter).toEqual({});
    expect(store.loadingPrefixCounter).toEqual({});
  });

  test("an obsolete tenant response cannot replace current employees", async () => {
    const firstRequest = deferred<Employee[]>();
    const secondRequest = deferred<Employee[]>();
    vi.mocked(employeeApi.listEmployees)
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const store = new EmployeeStore();

    const firstLoad = store.load(1);
    const secondLoad = store.load(2);
    secondRequest.resolve([employee(2, 2)]);
    await secondLoad;
    firstRequest.resolve([employee(1, 1)]);
    await firstLoad;

    expect(store.employees.map(({ id }) => id)).toEqual([2]);
  });

  test("a collection load atomically replaces the previous snapshot", async () => {
    vi.mocked(approvalRequestApi.listApprovalRequests)
      .mockResolvedValueOnce([approvalRequest(1), approvalRequest(2)])
      .mockResolvedValueOnce([approvalRequest(2)]);
    const store = new ApprovalRequestStore();

    await store.load();
    await store.load();

    expect(store.approvalRequests.map(({ id }) => id)).toEqual([2]);
  });

  test("incoming tasks retain every status returned by the API", async () => {
    vi.mocked(approvalRequestTaskApi.listApprovalRequestTasks).mockResolvedValue([
      approvalRequestTask(1, ApprovalRequestTaskStatus.Pending),
      approvalRequestTask(2, ApprovalRequestTaskStatus.Approved),
      approvalRequestTask(3, ApprovalRequestTaskStatus.Rejected),
      approvalRequestTask(4, ApprovalRequestTaskStatus.Skipped),
    ]);
    const store = new ApprovalRequestTaskStore();

    await store.loadIncoming();

    expect(store.tasks.map(({ status }) => status)).toEqual([
      ApprovalRequestTaskStatus.Skipped,
      ApprovalRequestTaskStatus.Rejected,
      ApprovalRequestTaskStatus.Approved,
      ApprovalRequestTaskStatus.Pending,
    ]);
  });

  test("signing out clears all session-scoped stores", () => {
    const currentEmployee = employee(1, 1);
    const tenant: Tenant = {
      id: 1,
      businessName: "Tenant",
      type: TenantType.Business,
      ownerId: "owner-id",
      isOwner: true,
      role: EmployeeRole.Admin,
    };
    const team: Team = {
      id: 1,
      tenantId: 1,
      name: "Team",
      members: [currentEmployee],
    };
    const template: ApprovalStepTemplate = {
      id: 1,
      tenantId: 1,
      name: "Template",
      steps: [],
    };
    const request = approvalRequest(1);
    runInAction(() => {
      stores.userAccountStore.currentUser = {
        email: "user@example.com",
        isEmailConfirmed: true,
      };
      stores.tenantStore.tenants = [tenant];
      stores.tenantStore.currentTenantId = tenant.id;
      stores.employeeStore.employees = [currentEmployee];
      stores.teamStore.teams = [team];
      stores.approvalStepTemplateStore.templates = [template];
      stores.approvalRequestStore.registry.set(request.id, request);
      stores.approvalRequestTaskStore.numberOfUncompletedTasks = 3;
    });
    stores.approvalRequestStore.setCurrent(request);
    stores.approvalRequestStore.setRequestToClone(request);
    stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true);

    stores.userAccountStore.signOut();

    expect(stores.userAccountStore.currentUser).toBeNull();
    expect(stores.tenantStore.tenants).toEqual([]);
    expect(stores.employeeStore.employees).toEqual([]);
    expect(stores.teamStore.teams).toEqual([]);
    expect(stores.approvalStepTemplateStore.templates).toEqual([]);
    expect(stores.approvalRequestStore.approvalRequests).toEqual([]);
    expect(stores.approvalRequestStore.currentApprovalRequest).toBeNull();
    expect(stores.approvalRequestStore.requestToClone).toBeNull();
    expect(stores.approvalRequestTaskStore.numberOfUncompletedTasks).toBe(0);
    expect(stores.commonStore.approvalRequestSubmitDialogIsOpen).toBe(false);
  });

  test("switching tenants clears scope before loading the new scope", async () => {
    vi.mocked(approvalRequestApi.listApprovalRequests)
      .mockClear()
      .mockResolvedValue([]);
    vi.mocked(approvalRequestTaskApi.countUncompletedApprovalRequestTasks)
      .mockClear()
      .mockResolvedValue(0);
    runInAction(() => {
      stores.teamStore.teams = [{
        id: 1,
        tenantId: 1,
        name: "Old tenant team",
        members: [],
      }];
      stores.approvalStepTemplateStore.templates = [{
        id: 1,
        tenantId: 1,
        name: "Old tenant template",
        steps: [],
      }];
    });

    await stores.switchTenant(2);

    expect(stores.tenantStore.currentTenantId).toBe(2);
    expect(stores.teamStore.teams).toEqual([]);
    expect(stores.approvalStepTemplateStore.templates).toEqual([]);
    expect(approvalRequestApi.listApprovalRequests).toHaveBeenCalledOnce();
    expect(
      approvalRequestTaskApi.countUncompletedApprovalRequestTasks,
    ).toHaveBeenCalledOnce();
  });
});
