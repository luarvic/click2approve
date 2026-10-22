import TenantScopeLayout from "@/layouts/TenantScopeLayout";
import { act, cleanup, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/rootStore", () => ({
  stores: {
    get tenantStore() {
      return tenantStore;
    },
    applicationConfigurationStore: { tenantsAreEnabled: true },
    billingAccessStore: { isBlocked: () => false },
  },
}));

const tenantStore = observable({
  hasLoaded: true,
  isRecoveringRevokedAccess: false,
  currentTenantGlobalId: "tenant-a",
  currentWorkEmployeeGlobalId: null as string | null,
  tenants: [{ globalId: "tenant-a" }],
});

const loads = vi.fn<(employee: string | null) => Promise<string>>();

// Like the grids, this page owns its rows and loads on mount.
const WorkspacePage = () => {
  const [rows, setRows] = useState("Loading");
  useEffect(() => {
    void loads(tenantStore.currentWorkEmployeeGlobalId).then(setRows);
  }, []);
  return <div>{rows}</div>;
};

const renderWorkspace = () =>
  render(
    <MemoryRouter initialEntries={["/tenants/tenant-a/tasks"]}>
      <Routes>
        <Route path="/tenants/:tenantGlobalId" element={<TenantScopeLayout />}>
          <Route path="tasks" element={<WorkspacePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const switchEmployee = (employee: string | null) =>
  act(() => {
    runInAction(() => {
      tenantStore.currentWorkEmployeeGlobalId = employee;
    });
  });

beforeEach(() => {
  vi.resetAllMocks();
  runInAction(() => {
    tenantStore.currentWorkEmployeeGlobalId = null;
  });
  loads.mockImplementation(async (employee) => `Tasks for ${employee ?? "self"}`);
});

afterEach(cleanup);

describe("workspace page refresh", () => {
  it("clears page data and reloads when switching employees within the same tenant, including back to self", async () => {
    renderWorkspace();
    expect(await screen.findByText("Tasks for self")).toBeTruthy();

    switchEmployee("employee-b");
    expect(screen.queryByText("Tasks for self")).toBeNull();
    expect(await screen.findByText("Tasks for employee-b")).toBeTruthy();

    switchEmployee(null);
    expect(screen.queryByText("Tasks for employee-b")).toBeNull();
    expect(await screen.findByText("Tasks for self")).toBeTruthy();
    expect(loads.mock.calls).toEqual([[null], ["employee-b"], [null]]);
  });

  it("does not display a previous employee's late page response after switching", async () => {
    let resolvePrevious!: (rows: string) => void;
    loads.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolvePrevious = resolve;
        }),
    );
    renderWorkspace();

    switchEmployee("employee-b");
    expect(await screen.findByText("Tasks for employee-b")).toBeTruthy();
    await act(async () => resolvePrevious("Previous employee tasks"));

    expect(screen.queryByText("Previous employee tasks")).toBeNull();
    expect(screen.getByText("Tasks for employee-b")).toBeTruthy();
  });
});
