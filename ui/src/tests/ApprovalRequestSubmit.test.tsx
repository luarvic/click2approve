import { stores } from "@/app/rootStore";
import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestSubmit, {
  ApprovalRequestSubmitDraft,
} from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/features/approvalRequests/api/approvalRequestsApi", () => ({
  resubmitApprovalRequest: vi.fn(),
  submitApprovalRequest: vi.fn(),
}));

vi.mock("@/features/approvalRequests/components/ApprovalRequestSubmitCompose", () => ({
  default: ({ onSubmit }: { onSubmit: React.FormEventHandler<HTMLFormElement> }) => (
    <form onSubmit={onSubmit}>
      <button type="submit">Next</button>
    </form>
  ),
}));

vi.mock("@/features/approvalRequests/components/ApprovalRequestSubmitVisibility", () => ({
  default: ({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) => (
    <>
      <button onClick={onBack}>Back</button>
      <button onClick={onSubmit}>Submit</button>
    </>
  ),
}));

const tenantGlobalId = "11111111-1111-4111-8111-111111111111";

const draft: ApprovalRequestSubmitDraft = {
  description: "Request description",
  existingFiles: [],
  newFiles: [
    {
      checked: false,
      createdAt: "2026-01-01T00:00:00Z",
      createdAtDate: new Date("2026-01-01T00:00:00Z"),
      globalId: "22222222-2222-4222-8222-222222222222",
      name: "request.pdf",
      size: 1,
      type: "application/pdf",
    },
  ],
  stepVisibility: {
    "1:2:0": false,
    "2:1:0": true,
  },
  stepVisibilityModes: {
    1: "allExcept",
    2: "selected",
  },
  steps: [
    {
      action: ApprovalRequestTaskAction.Approve,
      assignees: [{ email: "first@example.com", globalId: "first-assignee", type: AssigneeType.User }],
      isAttachmentRequired: false,
      isCommentRequired: false,
      isElectronicSignatureRequired: false,
      mode: ApprovalStepMode.Any,
      sequence: 1,
      visibilityMode: ApprovalStepVisibilityMode.AllParticipants,
    },
    {
      action: ApprovalRequestTaskAction.Approve,
      assignees: [{ email: "second@example.com", globalId: "second-assignee", type: AssigneeType.User }],
      isAttachmentRequired: false,
      isCommentRequired: false,
      isElectronicSignatureRequired: false,
      mode: ApprovalStepMode.Any,
      sequence: 2,
      visibilityMode: ApprovalStepVisibilityMode.AllParticipants,
    },
  ],
  title: "Request title",
};

const configureCurrentTenant = () => {
  stores.tenantStore.currentTenantGlobalId = tenantGlobalId;
  stores.tenantStore.tenants = [
    {
      businessName: "Personal",
      currentEmployeeRole: EmployeeRole.Owner,
      globalId: tenantGlobalId,
      type: TenantType.Personal,
    },
  ];
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  stores.tenantStore.clear();
  stores.approvalRequestStore.clear();
  stores.approvalRequestTaskStore.reset();
});

describe("<ApprovalRequestSubmit />", () => {
  test("preserves the complete draft when moving between compose and visibility", async () => {
    configureCurrentTenant();
    const user = userEvent.setup();
    const onShowVisibility = vi.fn();
    const onShowCompose = vi.fn();

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ApprovalRequestSubmit
          initialDraft={draft}
          onClose={vi.fn()}
          onComposeBreadcrumbClick={vi.fn()}
          onShowCompose={onShowCompose}
          onShowVisibility={onShowVisibility}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onShowVisibility).toHaveBeenCalledWith(draft);

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ApprovalRequestSubmit
          initialDraft={onShowVisibility.mock.calls[0][0]}
          isVisibilityPage
          onClose={vi.fn()}
          onComposeBreadcrumbClick={vi.fn()}
          onShowCompose={onShowCompose}
          onShowVisibility={vi.fn()}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(onShowCompose).toHaveBeenCalledWith(draft);
  });

  test("submits the selected visibility for every step participant", async () => {
    configureCurrentTenant();
    vi.mocked(approvalRequestApi.submitApprovalRequest).mockResolvedValue(null);
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ApprovalRequestSubmit
          initialDraft={draft}
          isVisibilityPage
          onClose={vi.fn()}
          onComposeBreadcrumbClick={vi.fn()}
          onShowCompose={vi.fn()}
          onShowVisibility={vi.fn()}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(approvalRequestApi.submitApprovalRequest).toHaveBeenCalledOnce();
    });

    const [tenantId, title, submittedSteps, stepVisibility, description, previousRevisionGlobalId, requestFiles] =
      vi.mocked(approvalRequestApi.submitApprovalRequest).mock.calls[0];

    expect(tenantId).toBe(tenantGlobalId);
    expect(title).toBe(draft.title);
    expect(submittedSteps.map(({ sequence, visibilityMode }) => ({ sequence, visibilityMode }))).toEqual([
      { sequence: 1, visibilityMode: ApprovalStepVisibilityMode.AllParticipantsExceptSelected },
      { sequence: 2, visibilityMode: ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants },
    ]);
    expect(stepVisibility).toEqual([
      { assigneeIndex: 0, assigneeStepSequence: 1, isVisible: true, stepSequence: 1 },
      { assigneeIndex: 0, assigneeStepSequence: 2, isVisible: false, stepSequence: 1 },
      { assigneeIndex: 0, assigneeStepSequence: 1, isVisible: true, stepSequence: 2 },
      { assigneeIndex: 0, assigneeStepSequence: 2, isVisible: true, stepSequence: 2 },
    ]);
    expect(description).toBe(draft.description);
    expect(previousRevisionGlobalId).toBeUndefined();
    expect(requestFiles).toEqual([
      {
        revisionAction: 1,
        sequence: 0,
        userFileGlobalId: draft.newFiles[0].globalId,
      },
    ]);
  });
});
