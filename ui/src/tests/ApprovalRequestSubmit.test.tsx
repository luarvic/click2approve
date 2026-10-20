import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import * as templateApi from "@/features/approvalStepTemplates/api/approvalStepTemplatesApi";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import * as employeeApi from "@/features/employees/api/employeesApi";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { notification } from "@/shared/utils/notifications";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const renderCompose = (onClose = vi.fn(), initialTemplateGlobalId?: string) => {
  const router = createMemoryRouter(
    [
      { path: "/away", element: <div>Another page</div> },
      {
        path: "*",
        element: <ApprovalRequestSubmit initialTemplateGlobalId={initialTemplateGlobalId} onClose={onClose} />,
      },
    ],
    { initialEntries: ["/away", "/compose"] },
  );
  return { ...render(<RouterProvider router={router} />), router };
};

describe("request composition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  beforeEach(() =>
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    ),
  );
  beforeEach(() => {
    sessionStorage.clear();
    runInAction(() => {
      stores.tenantStore.currentTenantGlobalId = "tenant-a";
      stores.userAccountStore.currentUser = { email: "alice@example.com", isEmailConfirmed: true };
      stores.approvalRequestStore.requestToClone = null;
    });
  });

  test("shows inline requirements and focuses the title after invalid submission", async () => {
    const user = userEvent.setup();
    const validationWarning = vi.spyOn(notification, "validationWarning");
    const otherWarning = vi.spyOn(notification, "warning");
    renderCompose();
    expect(screen.queryByText("Attach at least one file for approval.")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Title is required.")).toBeTruthy();
    expect(screen.getByText("Attach at least one file for approval.").getAttribute("role")).toBe("alert");
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(screen.queryByText("Complete the highlighted assignees.")).toBeNull();
    expect(validationWarning).toHaveBeenCalledTimes(1);
    expect(otherWarning).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /Title/ })));
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Budget");
    expect(screen.queryByText("Title is required.")).toBeNull();
  });

  test("loads template defaults before allowing edits so a slow response cannot overwrite the title", async () => {
    const tenants = stores.tenantStore.tenants;
    const configuration = stores.applicationConfigurationStore.applicationConfiguration;
    runInAction(() => {
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
    vi.spyOn(employeeApi, "listEmployeePicker").mockResolvedValue([]);
    let resolveTemplate!: (template: ApprovalStepTemplate) => void;
    vi.spyOn(templateApi, "getApprovalStepTemplate").mockReturnValue(
      new Promise((resolve) => {
        resolveTemplate = resolve;
      }),
    );
    const view = renderCompose(vi.fn(), "slow-template");
    try {
      expect(screen.queryByRole("textbox", { name: /Title/ })).toBeNull();
      await act(async () =>
        resolveTemplate({ globalId: "slow-template", tenantGlobalId: "tenant-a", name: "Template title", steps: [] }),
      );
      const title = await screen.findByRole("textbox", { name: /Title/ });
      expect((title as HTMLInputElement).value).toBe("Template title");
      const user = userEvent.setup();
      await user.clear(title);
      await user.type(title, "My document");
      expect((title as HTMLInputElement).value).toBe("My document");
    } finally {
      view.unmount();
      runInAction(() => {
        stores.tenantStore.tenants = tenants;
        stores.applicationConfigurationStore.applicationConfiguration = configuration;
      });
    }
  });

  test.each(["Cancel", "Escape"])(
    "%s leaves edited composition immediately without restoring a draft",
    async (action) => {
      const user = userEvent.setup();
      const confirm = vi.mocked(window.confirm);
      const onClose = vi.fn();
      const view = renderCompose(onClose);
      await user.type(screen.getByRole("textbox", { name: /Title/ }), "Quarterly budget");
      if (action === "Escape") {
        await user.keyboard("{Escape}");
      } else {
        await user.click(screen.getByRole("button", { name: "Cancel" }));
      }
      expect(confirm).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledOnce();
      expect(sessionStorage.length).toBe(0);
      view.unmount();
      renderCompose();
      expect((screen.getByRole("textbox", { name: /Title/ }) as HTMLInputElement).value).toBe("");
    },
  );
  test("allows navigation, Back, and browser unload with edits", async () => {
    const user = userEvent.setup();
    const { router } = renderCompose();
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Quarterly budget");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    await act(async () => {
      await router.navigate("/away");
    });
    expect(screen.getByText("Another page")).toBeTruthy();
    await act(async () => {
      await router.navigate(-1);
    });
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Updated budget");
    await act(async () => {
      await router.navigate(-1);
    });
    expect(screen.getByText("Another page")).toBeTruthy();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  test("leaves an untouched form without a warning", async () => {
    const user = userEvent.setup();
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    renderCompose(onClose);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
