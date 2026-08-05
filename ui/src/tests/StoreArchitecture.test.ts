import { stores } from "@/app/rootStore";
import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestsApi";
import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTasksApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalRequestStore } from "@/features/approvalRequests/stores/approvalRequestStore";
import { ApprovalRequestTaskStore } from "@/features/approvalRequests/stores/approvalRequestTaskStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import * as employeeApi from "@/features/employees/api/employeesApi";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeStore } from "@/features/employees/stores/employeeStore";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import { CommonStore } from "@/shared/stores/commonStore";
import { autorun, runInAction } from "mobx";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/features/approvalRequests/api/approvalRequestsApi", () => ({
  getApprovalRequest: vi.fn(),
  listApprovalRequests: vi.fn(),
}));

vi.mock("@/features/approvalRequests/api/approvalRequestTasksApi", () => ({
  countUncompletedApprovalRequestTasks: vi.fn(),
  getApprovalRequestTask: vi.fn(),
  listApprovalRequestTasks: vi.fn(),
}));

vi.mock("@/features/employees/api/employeesApi", () => ({
  listEmployees: vi.fn(),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
};

const employee = (globalId: string, tenantGlobalId: string): Employee => ({
  globalId,
  tenantGlobalId,
  email: `employee-@example.com`,
  displayName: "Employee",
  role: EmployeeRole.User,
  status: EmployeeStatus.Active,
});

const approvalRequest = (globalId: string): ApprovalRequest => ({
  globalId,
  title: `Request `,
  requestFiles: [],
  steps: [],
  createdAt: "2026-01-01T00:00:00",
  createdAtDate: new Date(),
  createdByUserId: "user-id",
  createdByEmail: "user@example.com",
  createdByDisplayName: "user@example.com",
  createdByOrganizationDisplayName: "Personal",
  revisionNumber: 1,
  status: ApprovalRequestStatus.Pending,
});

const approvalRequestTask = (
  globalId: string,
  status: ApprovalRequestTaskStatus,
  result?: boolean,
): ApprovalRequestTask => ({
  globalId,
  title: `Task `,
  approvalRequest: approvalRequest(globalId),
  approvalRequestGlobalId: globalId,
  approvalRequestStepGlobalId: globalId,
  action: ApprovalRequestTaskAction.Approve,
  approverEmail: "approver@example.com",
  approverDisplayName: "approver@example.com",
  requestedByEmail: "user@example.com",
  requestedByDisplayName: "user@example.com",
  createdByOrganizationDisplayName: "Personal",
  revisionNumber: 1,
  result,
  status,
  createdAt: "2026-01-01T00:00:00",
  createdAtDate: new Date(),
  requestFiles: [],
});

describe("store architecture", () => {
  test("unrelated action loaders do not invalidate a feature loading subscription", () => {
    const store = new CommonStore();
    let reactions = 0;
    const dispose = autorun(() => {
      store.isActionLoading("employees.save.employee-1");
      reactions += 1;
    });

    store.updateActionLoadingCounter("approvalRequestTasks.count", 1);
    store.updateActionLoadingCounter("approvalRequestTasks.count", -1);

    expect(reactions).toBe(1);
    expect(store.actionLoadingCounter).toEqual({});
    dispose();
  });

  test("action loading counters support concurrent work and remove completed entries", () => {
    const store = new CommonStore();
    const loader = "employees.save.employee-1";

    store.updateActionLoadingCounter(loader, 1);
    store.updateActionLoadingCounter(loader, 1);
    store.updateActionLoadingCounter(loader, -1);

    expect(store.isActionLoading(loader)).toBe(true);
    store.updateActionLoadingCounter(loader, -1);
    expect(store.isActionLoading(loader)).toBe(false);
    expect(store.actionLoadingCounter).toEqual({});
  });

  test("an obsolete tenant response cannot replace current employees", async () => {
    const firstRequest = deferred<Employee[]>();
    const secondRequest = deferred<Employee[]>();
    vi.mocked(employeeApi.listEmployees)
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const store = new EmployeeStore();

    const firstLoad = store.load("11111111-1111-4111-8111-111111111111");
    const secondLoad = store.load("22222222-2222-4222-8222-222222222222");
    secondRequest.resolve([employee("22222222-2222-4222-8222-222222222222", "22222222-2222-4222-8222-222222222222")]);
    await secondLoad;
    firstRequest.resolve([employee("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111")]);
    await firstLoad;

    expect(store.employees.map(({ globalId }) => globalId)).toEqual(["22222222-2222-4222-8222-222222222222"]);
  });

  test("a collection load atomically replaces the previous snapshot", async () => {
    vi.mocked(approvalRequestApi.listApprovalRequests)
      .mockResolvedValueOnce([approvalRequest("11111111-1111-4111-8111-111111111111"), approvalRequest("22222222-2222-4222-8222-222222222222")])
      .mockResolvedValueOnce([approvalRequest("22222222-2222-4222-8222-222222222222")]);
    const store = new ApprovalRequestStore();

    await store.load("11111111-1111-4111-8111-111111111111");
    await store.load("11111111-1111-4111-8111-111111111111");

    expect(store.approvalRequests.map(({ globalId }) => globalId)).toEqual(["22222222-2222-4222-8222-222222222222"]);
  });

  test("concurrent approval request detail loads share one API request", async () => {
    vi.mocked(approvalRequestApi.getApprovalRequest).mockResolvedValue(approvalRequest("11111111-1111-4111-8111-111111111111"));
    const store = new ApprovalRequestStore();

    const [first, second] = await Promise.all([
      store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111"),
      store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111"),
    ]);

    expect(approvalRequestApi.getApprovalRequest).toHaveBeenCalledOnce();
    expect(first).toBe(second);
    expect(store.getDetail("11111111-1111-4111-8111-111111111111")).toEqual(first);
  });

  test("sequential approval request detail loads fetch the latest record", async () => {
    vi.mocked(approvalRequestApi.getApprovalRequest)
      .mockClear()
      .mockResolvedValueOnce(approvalRequest("11111111-1111-4111-8111-111111111111"))
      .mockResolvedValueOnce({ ...approvalRequest("11111111-1111-4111-8111-111111111111"), title: "Updated request" });
    const store = new ApprovalRequestStore();

    await store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111");
    const latest = await store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111");

    expect(approvalRequestApi.getApprovalRequest).toHaveBeenCalledTimes(2);
    expect(latest?.title).toBe("Updated request");
    expect(store.getDetail("11111111-1111-4111-8111-111111111111")?.title).toBe("Updated request");
  });

  test("incoming tasks retain every status returned by the API", async () => {
    vi.mocked(approvalRequestTaskApi.listApprovalRequestTasks).mockResolvedValue([
      approvalRequestTask("11111111-1111-4111-8111-111111111111", ApprovalRequestTaskStatus.Pending),
      approvalRequestTask("22222222-2222-4222-8222-222222222222", ApprovalRequestTaskStatus.Completed, true),
      approvalRequestTask("33333333-3333-4333-8333-333333333333", ApprovalRequestTaskStatus.Completed, false),
      approvalRequestTask("44444444-4444-4444-8444-444444444444", ApprovalRequestTaskStatus.Skipped),
    ]);
    const store = new ApprovalRequestTaskStore();

    await store.loadIncoming("11111111-1111-4111-8111-111111111111");

    expect(store.tasks.map(({ status }) => status)).toEqual([
      ApprovalRequestTaskStatus.Pending,
      ApprovalRequestTaskStatus.Completed,
      ApprovalRequestTaskStatus.Completed,
      ApprovalRequestTaskStatus.Skipped,
    ]);
    expect(store.tasks.map(({ result }) => result)).toEqual([
      undefined,
      true,
      false,
      undefined,
    ]);
  });

  test("concurrent task detail loads share one API request", async () => {
    const task = approvalRequestTask("11111111-1111-4111-8111-111111111111", ApprovalRequestTaskStatus.Pending);
    vi.mocked(approvalRequestTaskApi.getApprovalRequestTask).mockResolvedValue(task);
    const store = new ApprovalRequestTaskStore();

    const [first, second] = await Promise.all([
      store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111"),
      store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111"),
    ]);

    expect(approvalRequestTaskApi.getApprovalRequestTask).toHaveBeenCalledOnce();
    expect(first).toBe(second);
    expect(store.getDetail("11111111-1111-4111-8111-111111111111")).toEqual(first);
  });

  test("sequential task detail loads fetch the latest record", async () => {
    vi.mocked(approvalRequestTaskApi.getApprovalRequestTask)
      .mockClear()
      .mockResolvedValueOnce(approvalRequestTask("11111111-1111-4111-8111-111111111111", ApprovalRequestTaskStatus.Pending))
      .mockResolvedValueOnce(approvalRequestTask("11111111-1111-4111-8111-111111111111", ApprovalRequestTaskStatus.Completed, true));
    const store = new ApprovalRequestTaskStore();

    await store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111");
    const latest = await store.loadDetails("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111");

    expect(approvalRequestTaskApi.getApprovalRequestTask).toHaveBeenCalledTimes(2);
    expect(latest?.status).toBe(ApprovalRequestTaskStatus.Completed);
    expect(latest?.result).toBe(true);
    expect(store.getDetail("11111111-1111-4111-8111-111111111111")?.status).toBe(ApprovalRequestTaskStatus.Completed);
    expect(store.getDetail("11111111-1111-4111-8111-111111111111")?.result).toBe(true);
  });

  test("signing out clears all session-scoped stores", () => {
    const currentEmployee = employee("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111");
    const tenant: Tenant = {
      globalId: "11111111-1111-4111-8111-111111111111",
      businessName: "Tenant",
      type: TenantType.Business,
      ownerId: "owner-id",
      isOwner: true,
      role: EmployeeRole.Admin,
    };
    const team: Team = {
      globalId: "11111111-1111-4111-8111-111111111111",
      tenantGlobalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Team",
      members: [currentEmployee],
    };
    const template: ApprovalStepTemplate = {
      globalId: "11111111-1111-4111-8111-111111111111",
      tenantGlobalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Template",
      steps: [],
    };
    const request = approvalRequest("11111111-1111-4111-8111-111111111111");
    runInAction(() => {
      stores.userAccountStore.currentUser = {
        email: "user@example.com",
        isEmailConfirmed: true,
      };
      stores.tenantStore.tenants = [tenant];
      stores.tenantStore.currentTenantGlobalId = tenant.globalId;
      stores.employeeStore.employees = [currentEmployee];
      stores.teamStore.teams = [team];
      stores.approvalStepTemplateStore.templates = [template];
      stores.approvalRequestStore.registry.set(request.globalId, request);
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
        globalId: "11111111-1111-4111-8111-111111111111",
        tenantGlobalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        name: "Old tenant team",
        members: [],
      }];
      stores.approvalStepTemplateStore.templates = [{
        globalId: "11111111-1111-4111-8111-111111111111",
        tenantGlobalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        name: "Old tenant template",
        steps: [],
      }];
    });

    await stores.switchTenant("cccccccc-cccc-4ccc-8ccc-cccccccccccc");

    expect(stores.tenantStore.currentTenantGlobalId).toBe("cccccccc-cccc-4ccc-8ccc-cccccccccccc");
    expect(stores.teamStore.teams).toEqual([]);
    expect(stores.approvalStepTemplateStore.templates).toEqual([]);
    expect(approvalRequestApi.listApprovalRequests).toHaveBeenCalledOnce();
    expect(
      approvalRequestTaskApi.countUncompletedApprovalRequestTasks,
    ).toHaveBeenCalledOnce();
  });
});
