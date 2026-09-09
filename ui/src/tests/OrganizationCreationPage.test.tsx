import OrganizationCreationPage from "@/features/tenants/pages/OrganizationCreationPage";
import OrganizationPlanSelectionPage from "@/features/tenants/pages/OrganizationPlanSelectionPage";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  createWithLogo: vi.fn(),
  recover: vi.fn(),
  clear: vi.fn(),
  loadPlans: vi.fn(),
  updateActionLoadingCounter: vi.fn(),
  select: vi.fn(),
  block: vi.fn(),
  success: vi.fn(),
}));
vi.mock("@/app/rootStore", () => ({
  stores: {
    tenantStore: {
      hasLoaded: true,
      create: mocks.create,
      createWithLogo: mocks.createWithLogo,
      setCurrentScope: mocks.select,
    },
    billingAccessStore: { block: mocks.block },
    commonStore: { updateActionLoadingCounter: mocks.updateActionLoadingCounter },
    applicationConfigurationStore: {},
    clearTenantScope: mocks.clear,
  },
}));
vi.mock("@/features/subscriptions/api/subscriptionsApi", () => ({
  getSubscriptionPlans: mocks.loadPlans,
  recoverPayment: mocks.recover,
}));
vi.mock("@/shared/utils/persistenceNotifications", () => ({
  PersistenceSuccessMessages: {},
  showPersistenceSuccessNotification: mocks.success,
}));
vi.mock("@/shared/components/images/ImagePicker", () => ({
  default: ({ selectedFile, onSave }: { selectedFile?: File; onSave: (file: File) => void }) => (
    <label>
      Logo
      <input
        type="file"
        onChange={(event) => {
          if (event.target.files?.[0]) onSave(event.target.files[0]);
        }}
      />
      <span>{selectedFile?.name}</span>
    </label>
  ),
}));
const showPage = (path = "/tenants/new") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tenants/new" element={<OrganizationCreationPage />}>
          <Route path="plans" element={<OrganizationPlanSelectionPage />} />
        </Route>
        <Route path="/tenants" element={<div>Organizations list</div>} />
        <Route path="/tenants/:tenantGlobalId/plans" element={<div>Organization billing</div>} />
      </Routes>
    </MemoryRouter>,
  );
const next = () => {
  fireEvent.change(screen.getByRole("textbox", { name: /Business name/ }), { target: { value: "Acme" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
};
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({ globalId: "created" });
  mocks.createWithLogo.mockResolvedValue({ globalId: "created" });
  mocks.loadPlans.mockResolvedValue([]);
  mocks.recover.mockResolvedValue("https://checkout.stripe.com/test");
});

describe("organization creation", () => {
  it("tracks the plan-list request with the shared subscription-plan loader", async () => {
    let resolvePlans: (plans: []) => void = () => undefined;
    mocks.loadPlans.mockReturnValueOnce(
      new Promise<[]>((resolve) => {
        resolvePlans = resolve;
      }),
    );
    showPage();
    next();

    await waitFor(() => expect(mocks.loadPlans).toHaveBeenCalledOnce());
    expect(mocks.updateActionLoadingCounter).toHaveBeenCalledWith("subscriptionPlan.load", 1);

    resolvePlans([]);
    await screen.findByRole("button", { name: "Choose Business Trial" });
    expect(mocks.updateActionLoadingCounter).toHaveBeenLastCalledWith("subscriptionPlan.load", -1);
  });

  it("uses Next without creating an organization and preserves details and logo on Back", async () => {
    showPage();
    expect(screen.queryByRole("combobox", { name: "Plan" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    const logo = new File(["logo"], "logo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Logo"), { target: { files: [logo] } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "team@example.com" } });
    next();
    await screen.findByRole("button", { name: "Choose Business Trial" });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.createWithLogo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect((screen.getByRole("textbox", { name: /Business name/ }) as HTMLInputElement).value).toBe("Acme");
    expect((screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement).value).toBe("team@example.com");
    expect(screen.getByText("logo.png")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Trial" }));
    await screen.findByText("Organizations list");
    expect(mocks.createWithLogo).toHaveBeenCalledWith(
      expect.objectContaining({
        businessName: "Acme",
        email: "team@example.com",
        subscriptionPlan: SubscriptionPlan.BusinessTrial,
      }),
      logo,
      false,
    );
    expect(mocks.recover).not.toHaveBeenCalled();
    expect(mocks.select).toHaveBeenCalledWith("created", null);
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("keeps plan selection open when the server rejects an already-used trial", async () => {
    mocks.create.mockResolvedValueOnce(null);
    showPage();
    next();
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Trial" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Choose Business Starter" }).hasAttribute("disabled")).toBe(false),
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionPlan: SubscriptionPlan.BusinessTrial }),
      false,
    );
    expect(mocks.recover).not.toHaveBeenCalled();
    expect(screen.queryByText("Organization billing")).toBeNull();
  });

  it("creates the paid organization before opening Checkout", async () => {
    const assign = vi.spyOn(window.location, "assign").mockImplementation(() => undefined);
    mocks.recover.mockImplementation(async () => {
      expect(mocks.create).toHaveBeenCalledTimes(1);
      return "https://checkout.stripe.com/test";
    });
    showPage();
    next();
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Starter" }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/test"));
    expect(mocks.recover).toHaveBeenCalledWith("created");
    expect(screen.queryByText("Organization billing")).toBeNull();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionPlan: SubscriptionPlan.BusinessStarter }),
      false,
    );
  });

  it("stays on Choose plan with controls disabled while Checkout is starting", async () => {
    mocks.recover.mockReturnValue(new Promise(() => undefined));
    showPage();
    next();
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Starter" }));
    await waitFor(() => expect(mocks.recover).toHaveBeenCalledWith("created"));
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.select).not.toHaveBeenCalled();
    expect(screen.queryByText("Organization billing")).toBeNull();
    expect(screen.getByRole("button", { name: "Back" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Choose Business Starter" }).hasAttribute("disabled")).toBe(true);
  });

  it("opens Organizations with the created organization selected if Checkout cannot start", async () => {
    mocks.recover.mockRejectedValue(new Error("Payment unavailable"));
    showPage();
    next();
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Standard" }));
    await screen.findByText("Organizations list");
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.recover).toHaveBeenCalledWith("created");
    expect(mocks.block).toHaveBeenCalledWith("created");
    expect(mocks.select).toHaveBeenCalledWith("created", null);
    expect(mocks.block.mock.invocationCallOrder[0]).toBeLessThan(mocks.select.mock.invocationCallOrder[0]);
  });

  it("disables other choices and Back while creating, preventing duplicate submissions", async () => {
    mocks.create.mockReturnValue(new Promise(() => undefined));
    showPage();
    next();
    fireEvent.click(await screen.findByRole("button", { name: "Choose Business Ultimate" }));
    expect(screen.getByRole("button", { name: "Back" }).hasAttribute("disabled")).toBe(true);
    const other = screen.getByRole("button", { name: "Choose Business Trial" });
    expect(other.hasAttribute("disabled")).toBe(true);
    fireEvent.click(other);
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it("returns direct plan-page visits without a draft to organization details", () => {
    showPage("/tenants/new/plans");
    expect(screen.getByRole("button", { name: "Next" })).toBeTruthy();
  });
});
