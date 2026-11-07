import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import ApprovalRequestStartPage from "@/features/approvalRequests/pages/ApprovalRequestStartPage";
import * as templateApi from "@/features/approvalStepTemplates/api/approvalStepTemplatesApi";
import ApprovalStepTemplateEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateDialog";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { ApprovalStepMode, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import * as employeeApi from "@/features/employees/api/employeesApi";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { notification } from "@/shared/utils/notifications";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { MemoryRouter, RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const template: ApprovalStepTemplate = {
  globalId: "template-a",
  tenantGlobalId: "tenant-a",
  name: "Review workflow",
  description: "Reusable instructions",
  ownerDisplayName: "Another member",
  isOwner: false,
  shared: true,
  steps: [
    {
      sequence: 1,
      mode: ApprovalStepMode.All,
      action: ApprovalRequestTaskAction.Approve,
      assignees: [{ type: AssigneeType.User, email: "reviewer@example.com" }],
    },
  ],
};

describe("shared templates", () => {
  const originalTenants = stores.tenantStore.tenants;
  const originalTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const originalConfiguration = stores.applicationConfigurationStore.applicationConfiguration;
  const originalTemplates = stores.approvalStepTemplateStore.templates;
  const originalHasLoaded = stores.tenantStore.hasLoaded;
  const originalRequestToClone = stores.approvalRequestStore.requestToClone;

  beforeEach(() => {
    vi.spyOn(employeeApi, "listEmployeePicker").mockResolvedValue([]);
    runInAction(() => {
      stores.tenantStore.currentTenantGlobalId = "tenant-a";
      stores.tenantStore.hasLoaded = true;
      stores.approvalRequestStore.requestToClone = null;
      stores.tenantStore.tenants = [
        {
          globalId: "tenant-a",
          businessName: "Organization",
          type: TenantType.Business,
          currentEmployeeRole: EmployeeRole.Owner,
        },
      ];
      stores.applicationConfigurationStore.applicationConfiguration = {
        avatarImageSize: 256,
        logoImageSize: 256,
        edition: "Business",
        requiresConfirmedEmail: false,
        capabilities: {
          apiTokens: false,
          tenants: true,
          discussions: false,
          discussionAttachments: false,
          employeeAssignees: false,
          teamAssignees: false,
          approvalStepTemplates: true,
          approvalRequestRevisions: false,
          receipts: false,
          subscriptions: false,
          taskAttachments: false,
        },
      };
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    runInAction(() => {
      stores.tenantStore.tenants = originalTenants;
      stores.tenantStore.currentTenantGlobalId = originalTenantGlobalId;
      stores.applicationConfigurationStore.applicationConfiguration = originalConfiguration;
      stores.approvalStepTemplateStore.templates = originalTemplates;
      stores.tenantStore.hasLoaded = originalHasLoaded;
      stores.approvalRequestStore.requestToClone = originalRequestToClone;
    });
  });

  test("shows another member's shared template as read-only even for an organization owner", () => {
    render(
      <MemoryRouter>
        <ApprovalStepTemplateEditor template={template} onClose={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>,
    );
    expect((screen.getByRole("textbox", { name: /^Name/ }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Shared" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("textbox", { name: "Owner" }) as HTMLInputElement).value).toBe("Another member");
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add step" })).toBeNull();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  test("lets the owner change the sharing setting", async () => {
    const update = vi
      .spyOn(templateApi, "updateApprovalStepTemplate")
      .mockResolvedValue({ ...template, isOwner: true });
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ApprovalStepTemplateEditor template={{ ...template, isOwner: true }} onClose={onClose} onDelete={vi.fn()} />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: "Shared" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith("tenant-a", "template-a", expect.objectContaining({ shared: false })),
    );
    expect(onClose).toHaveBeenCalledWith("template-a");
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  test("creates templates as private unless sharing is selected", async () => {
    const create = vi
      .spyOn(templateApi, "createApprovalStepTemplate")
      .mockResolvedValue({ ...template, isOwner: true });
    render(
      <MemoryRouter>
        <ApprovalStepTemplateEditor template={null} onClose={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    expect((screen.getByRole("checkbox", { name: "Shared" }) as HTMLInputElement).checked).toBe(false);
    await user.type(screen.getByRole("textbox", { name: /^Name/ }), "New workflow");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "reviewer@example.com");
    await user.click(screen.getByRole("checkbox", { name: "Shared" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith("tenant-a", expect.objectContaining({ name: "New workflow", shared: true })),
    );
  });

  test.each([false, true])("hides Save template for requests from a template (owned: %s)", async (isOwner) => {
    vi.spyOn(templateApi, "getApprovalStepTemplate").mockResolvedValue({ ...template, isOwner });
    render(
      <MemoryRouter>
        <ApprovalRequestSubmit initialTemplateGlobalId="template-a" onClose={vi.fn()} />
      </MemoryRouter>,
    );
    await screen.findByRole("textbox", { name: /^Title/ });
    expect(screen.queryByRole("button", { name: "Save template" })).toBeNull();
  });

  test("hides Save template when revising a request", () => {
    const request: ApprovalRequest = {
      globalId: "request-a",
      title: "Revision",
      status: ApprovalRequestStatus.Completed,
      createdAt: "2026-11-01T00:00:00Z",
      createdAtDate: new Date("2026-11-01T00:00:00Z"),
      revisionNumber: 1,
      requesterDisplayName: "Requester",
      requesterEmail: "requester@example.com",
      requesterUserGlobalId: "user-a",
      submittedByUserGlobalId: "user-a",
      submittedByDisplayName: "Requester",
      submittedByEmail: "requester@example.com",
      organizationDisplayName: "Organization",
      requestFiles: [],
      steps: template.steps,
    };
    runInAction(() => {
      stores.approvalRequestStore.requestToClone = request;
      stores.applicationConfigurationStore.applicationConfiguration!.capabilities.approvalRequestRevisions = true;
    });
    render(
      <MemoryRouter>
        <ApprovalRequestSubmit onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: "Save template" })).toBeNull();
  });

  test("custom requests create private templates and show name conflicts beside Title without overwriting", async () => {
    const message = "You already have a private template with this name in this organization.";
    const create = vi.spyOn(templateApi, "createApprovalStepTemplate").mockImplementation(async () => {
      notification.error({ message: "Invalid input", details: [{ label: "Validation error: Name", value: message }] });
      return null;
    });
    const update = vi.spyOn(templateApi, "updateApprovalStepTemplate");
    render(
      <MemoryRouter>
        <ApprovalRequestSubmit onClose={vi.fn()} />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    const title = screen.getByRole("textbox", { name: /^Title/ });
    await user.type(title, "Review workflow");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "reviewer@example.com");
    await user.click(screen.getByRole("button", { name: "Save template" }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        "tenant-a",
        expect.objectContaining({ shared: false, name: "Review workflow" }),
      ),
    );
    expect(await screen.findByText(message)).toBeTruthy();
    expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(update).not.toHaveBeenCalled();
    await user.type(title, " revised");
    expect(screen.queryByText(message)).toBeNull();
  });

  test.each(["Private", "Shared"])(
    "selects the correct same-name %s template from its group using name-only labels",
    async (scope) => {
      vi.spyOn(templateApi, "listApprovalStepTemplates").mockResolvedValue([
        { ...template, globalId: "shared-template" },
        { ...template, globalId: "private-template", shared: false, isOwner: true },
      ]);
      const router = createMemoryRouter(
        [
          { path: "/tenants/tenant-a/requests/new", element: <ApprovalRequestStartPage /> },
          { path: "/tenants/tenant-a/requests/new/compose", element: <div>Compose request</div> },
        ],
        { initialEntries: ["/tenants/tenant-a/requests/new"] },
      );
      render(<RouterProvider router={router} />);
      const user = userEvent.setup();
      await user.click(screen.getByRole("radio", { name: "From template" }));
      await user.click(screen.getByRole("combobox", { name: "Template" }));
      expect(await screen.findByText("Private templates")).toBeTruthy();
      expect(screen.getByText("Shared templates")).toBeTruthy();
      const options = screen.getAllByRole("option", { name: "Review workflow" });
      expect(options).toHaveLength(2);
      await user.click(options[scope === "Private" ? 0 : 1]);
      expect(screen.getByRole("combobox", { name: "Template" }).textContent).toBe("Review workflow");
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(router.state.location.state).toEqual({ templateGlobalId: `${scope.toLowerCase()}-template` });
    },
  );
});
