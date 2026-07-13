import { stores } from "@/app/rootStore";
import {
  cancelApprovalRequest,
  deleteApprovalRequest,
  replaceApprovalRequestShares,
  updateApprovalRequest,
} from "@/features/approvalRequests/api/approvalRequestApi";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import ApprovalRequestSharing, {
  EditableApprovalRequestShare,
} from "@/features/approvalRequests/components/ApprovalRequestSharing";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyApprover,
  createEmptyStep,
  EditableApprovalStep,
  toApprovalStepUpdates,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Dialogs, Pages } from "@/shared/constants/constants";
import { validateEmails } from "@/shared/utils/validators";
import type { SxProps } from "@mui/material";
import {
  Button,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const getApprovalStepSx = (isPassed: boolean): SxProps<Theme> => ({
  bgcolor: isPassed ? "action.hover" : "background.paper",
  opacity: isPassed ? 0.72 : 1,
});

const getStepTasks = (approvalRequest: ApprovalRequest, step: ApprovalStep) => {
  const stepTasks = step.tasks?.filter(Boolean) ?? [];
  const stepTaskIds = new Set(stepTasks.map((task) => task.id));
  const requestStepTasks = (approvalRequest.tasks ?? [])
    .filter(Boolean)
    .filter(
      (task) =>
        task.approvalRequestStepId === step.id ||
        (stepTaskIds.size > 0 && stepTaskIds.has(task.id)),
    );
  return [...stepTasks, ...requestStepTasks].filter(
    (task, index, tasks) =>
      tasks.findIndex((item) => item.id === task.id) === index,
  );
};

const getApproverTasks = (
  tasks: ApprovalRequestTask[],
  approverId: number | undefined,
) => {
  if (!approverId) {
    return [];
  }
  return tasks.filter(
    (task) => task.approvalRequestStepApproverId === approverId,
  );
};

const stepHasPassed = (tasks: ApprovalRequestTask[]) =>
  tasks.length > 0 &&
  tasks.every(
    (task) =>
      task.status === ApprovalRequestTaskStatus.Approved ||
      task.status === ApprovalRequestTaskStatus.Skipped,
  );

const getLockInfo = (approvalRequest: ApprovalRequest) => {
  const steps = (approvalRequest.steps ?? []).filter(Boolean);
  const passedStepIds = new Set(
    steps
      .filter(
        (step) => step.id && stepHasPassed(getStepTasks(approvalRequest, step)),
      )
      .map((step) => step.id!),
  );
  const currentStep = steps
    .filter((step) =>
      getStepTasks(approvalRequest, step).some(
        (task) => task.status === ApprovalRequestTaskStatus.Pending,
      ),
    )
    .sort((a, b) => a.sequence - b.sequence)[0];

  return {
    currentStepId: currentStep?.id,
    lockedStepIds: new Set([
      ...passedStepIds,
      ...(currentStep?.id ? [currentStep.id] : []),
    ]),
  };
};

const isLockedTarget = (
  step: ApprovalStep,
  lockInfo: ReturnType<typeof getLockInfo> | null,
) => Boolean(step.id && lockInfo?.lockedStepIds.has(step.id));

interface ApprovalRequestEditorProps {
  onClose: (currentApprovalRequestId?: number) => void;
  onClone: () => void;
}

const ApprovalRequestEditor: React.FC<ApprovalRequestEditorProps> = ({ onClose, onClone }) => {
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const [steps, setSteps] = useState<EditableApprovalStep[]>([]);
  const [shares, setShares] = useState<EditableApprovalRequestShare[] | null>(null);
  const [canManageShares, setCanManageShares] = useState<boolean | null>(null);

  const tenantId = stores.tenantStore.currentTenantId;
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;
  const canUseApprovalRequestSharing =
    businessTenantIsSelected &&
    stores.productStore.approvalRequestSharingIsEnabled;
  const sharingIsAvailable =
    canUseApprovalRequestSharing && approvalRequest !== null;
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("request");

  useEffect(() => {
    setSteps(
      createEditableSteps(
        (approvalRequest?.steps ?? [])
          .filter(Boolean)
          .sort((a, b) => a.sequence - b.sequence),
      ),
    );
    setSelectedTab("request");
    setShares(null);
    setCanManageShares(null);
    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees || canUseApprovalRequestSharing) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams || canUseApprovalRequestSharing) {
        stores.teamStore.load(tenantId);
      }
    }
  }, [
    approvalRequest,
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
    canUseApprovalRequestSharing,
  ]);

  const handleClose = () => {
    onClose(approvalRequest?.id);
  };

  const updateStep = (
    stepIndex: number,
    updater: (step: EditableApprovalStep) => EditableApprovalStep,
  ) => {
    setSteps((current) =>
      current.map((step, index) =>
        index === stepIndex ? updater(step) : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((current) => [
      ...current,
      createEmptyStep(current.length + 1, false),
    ]);
  };

  const removeStep = (stepIndex: number) => {
    setSteps((current) =>
      current
        .filter((_, index) => index !== stepIndex)
        .map((step, index) => ({ ...step, sequence: index + 1 })),
    );
  };

  const moveStep = (stepIndex: number, direction: -1 | 1) => {
    const nextIndex = stepIndex + direction;
    setSteps((current) => {
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      [reordered[stepIndex], reordered[nextIndex]] = [
        reordered[nextIndex],
        reordered[stepIndex],
      ];
      return reordered.map((step, index) => ({ ...step, sequence: index + 1 }));
    });
  };

  const addApprover = (stepIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: [...step.approvers, createEmptyApprover()],
    }));
  };

  const updateApprover = (
    stepIndex: number,
    approverIndex: number,
    approver: ApprovalStepApprover,
  ) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: step.approvers.map((item, index) =>
        index === approverIndex ? approver : item,
      ),
    }));
  };

  const removeApprover = (stepIndex: number, approverIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: step.approvers.filter((_, index) => index !== approverIndex),
    }));
  };

  const validateSteps = () => {
    const emails = steps.flatMap((step) =>
      step.approvers
        .filter((approver) => approver.type === ApprovalRecipientType.Email)
        .map((approver) => approver.email ?? ""),
    );
    const hasMissingRecipient = steps.some(
      (step) =>
        step.approvers.length === 0 ||
        step.approvers.some((approver) => {
          if (approver.type === ApprovalRecipientType.Email) {
            return !approver.email?.trim();
          }
          if (approver.type === ApprovalRecipientType.Employee) {
            return !approver.employeeId;
          }
          return !approver.teamId;
        }),
    );

    if (hasMissingRecipient || (emails.length > 0 && !validateEmails(emails))) {
      toast.error("Specify valid approvers for every step.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!approvalRequest || !validateSteps()) {
      return;
    }

    const sharesAreValid = !shares?.some(
      (share) => !share.employeeId && !share.teamId,
    );
    if (!sharesAreValid) {
      toast.error("Select an employee or team for every access entry.");
      return;
    }

    if (
      !await updateApprovalRequest(
        approvalRequest.id,
        toApprovalStepUpdates(steps),
      )
    ) {
      return;
    }

    const sharesSaved =
      shares === null ||
      !canManageShares ||
      await replaceApprovalRequestShares(
        approvalRequest.id,
        shares.map(({ employeeId, permission, teamId }) => ({
          employeeId,
          permission,
          teamId,
        })),
      );
    if (sharesSaved) {
      stores.approvalRequestStore.clear();
      stores.approvalRequestStore.load();
      stores.approvalRequestTaskStore.loadUncompletedCount();
      toast.success("Approval request updated.");
      onClose(approvalRequest.id);
    }
  };

  const handleSharesChange = useCallback(
    (value: EditableApprovalRequestShare[]) => {
      setShares(value);
    },
    [],
  );

  const handleCanManageSharesChange = useCallback((value: boolean) => {
    setCanManageShares(value);
  }, []);

  const handleClone = () => {
    if (!approvalRequest) {
      return;
    }
    stores.approvalRequestStore.setRequestToClone(approvalRequest);
    onClone();
  };

  const lockInfo = approvalRequest ? getLockInfo(approvalRequest) : null;

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Approval request
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_, value: string) => setSelectedTab(value)}
        aria-label="Approval request sections"
      >
        <Tab label="Request" value="request" />
        {sharingIsAvailable && <Tab label="Sharing" value="sharing" />}
        <Tab label="Log" value="log" />
      </Tabs>
      {selectedTab === "request" && (
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
          <TextField
            margin="normal"
            fullWidth
            label="Title"
            value={approvalRequest?.title ?? ""}
            disabled
          />
          <ApprovalRequestFilesBox userFiles={approvalRequest?.userFiles} />
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            multiline
            value={approvalRequest?.description ?? ""}
            disabled
          />
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.contentStackSx}>
            <ApprovalStepEditor
              steps={steps}
              canUseEmployees={canUseEmployees}
              canUseTeams={canUseTeams}
              employees={stores.employeeStore.employees}
              teams={stores.teamStore.teams}
              getStepState={(step, stepIndex) => {
                const persistedStep = approvalRequest?.steps.find(
                  (item) => item.id === step.id,
                );
                const stepTasks =
                  approvalRequest && persistedStep
                    ? getStepTasks(approvalRequest, persistedStep)
                    : [];
                const isPassed = Boolean(
                  persistedStep && stepHasPassed(stepTasks),
                );
                const isCurrent = Boolean(
                  lockInfo?.currentStepId && step.id === lockInfo.currentStepId,
                );
                const stepOrderLocked =
                  Boolean(step.id && lockInfo?.lockedStepIds.has(step.id)) ||
                  isCurrent;
                const canMoveUp =
                  stepIndex > 0 &&
                  !stepOrderLocked &&
                  !isLockedTarget(steps[stepIndex - 1], lockInfo);
                const canMoveDown =
                  stepIndex < steps.length - 1 &&
                  !stepOrderLocked &&
                  !isLockedTarget(steps[stepIndex + 1], lockInfo);

                return {
                  canAddApprover: !isPassed,
                  canMoveDown,
                  canMoveUp,
                  canRemove: steps.length > 1 && !isPassed && !isCurrent,
                  disabled: isPassed || isCurrent,
                  isCurrent,
                  isPassed,
                  sx: getApprovalStepSx(isPassed),
                };
              }}
              getApproverState={(step, _, approver) => {
                const persistedStep = approvalRequest?.steps.find(
                  (item) => item.id === step.id,
                );
                const stepTasks =
                  approvalRequest && persistedStep
                    ? getStepTasks(approvalRequest, persistedStep)
                    : [];
                const touched = getApproverTasks(stepTasks, approver.id).some(
                  (task) => task.status !== ApprovalRequestTaskStatus.Pending,
                );
                const isPassed = Boolean(
                  persistedStep && stepHasPassed(stepTasks),
                );
                const isCurrent = Boolean(
                  lockInfo?.currentStepId && step.id === lockInfo.currentStepId,
                );
                const disabled = isPassed || (isCurrent && touched);

                return {
                  disabled,
                  muted: isPassed || touched,
                  removeDisabled: disabled,
                };
              }}
              onAddApprover={addApprover}
              onAddStep={addStep}
              onMoveStep={moveStep}
              onRemoveApprover={removeApprover}
              onRemoveStep={removeStep}
              onUpdateApprover={updateApprover}
              onUpdateStep={updateStep}
            />
          </Stack>
        </Stack>
      )}
      {selectedTab === "log" && <ApprovalRequestLog approvalRequest={approvalRequest} />}
      {selectedTab === "sharing" && approvalRequest && (
        <ApprovalRequestSharing
          approvalRequestId={approvalRequest.id}
          employees={stores.employeeStore.employees.filter(
            (employee) => employee.userId !== approvalRequest.createdByUserId,
          )}
          shares={shares ?? []}
          teams={stores.teamStore.teams}
          onCanManageChange={handleCanManageSharesChange}
          onSharesChange={handleSharesChange}
        />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        <Button variant="outlined" onClick={handleClone}>Clone</Button>
        {approvalRequest?.status === ApprovalRequestStatus.Pending && (
          <Button
            variant="outlined"
            onClick={async () => {
              if (await cancelApprovalRequest(approvalRequest.id)) {
                stores.approvalRequestStore.clear();
                await stores.approvalRequestStore.load();
                onClose(approvalRequest.id);
              }
            }}
          >
            Cancel request
          </Button>
        )}
        <Button
          color="error"
          variant="outlined"
          onClick={() => {
            setDeleteDialogIsOpen(true);
          }}
        >
          Delete
        </Button>
        <Button variant="outlined" onClick={handleSave}>Save</Button>
      </Stack>
      {approvalRequest && (
        <DeleteConfirmationDialog
          cancelFirst
          cancelLabel="Cancel"
          entityName={approvalRequest.title}
          open={deleteDialogIsOpen}
          title="Delete approval request"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={async () => {
            const deleted = await deleteApprovalRequest(approvalRequest.id);
            if (deleted) {
              stores.approvalRequestStore.clear();
              stores.approvalRequestStore.load();
              onClose();
            }
            return deleted;
          }}
        />
      )}
    </>
  );
};

export default observer(ApprovalRequestEditor);
