import { stores } from "@/app/stores";
import { updateApprovalRequestSteps } from "@/features/approvalRequests/api/approvalRequestApi";
import {
  ApprovalRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalStepApproverRow from "@/features/approvalWorkflow/components/ApprovalStepApproverRow";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { Dialogs } from "@/shared/constants/constants";
import { validateEmails } from "@/shared/utils/validators";
import {
  Add,
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const emptyApprover = (): ApprovalStepApprover => ({
  type: ApprovalRecipientType.Email,
  email: "",
  canViewRequest: true,
});

const emptyStep = (sequence: number): ApprovalStep => ({
  sequence,
  mode: ApprovalStepMode.Any,
  approvers: [emptyApprover()],
});

const getApprovalStepSx = (isPassed: boolean): SxProps<Theme> => ({
  ...Dialogs.approvalStepSx,
  bgcolor: isPassed ? "action.hover" : "background.paper",
  opacity: isPassed ? 0.72 : 1,
});

const cloneSteps = (steps: ApprovalStep[]) =>
  steps
    .filter(Boolean)
    .sort((a, b) => a.sequence - b.sequence)
    .map((step, index) => ({
      id: step.id,
      sequence: index + 1,
      mode: step.mode,
      approvers: step.approvers.map((approver) => ({
        id: approver.id,
        type: approver.type,
        email: approver.email,
        employeeId: approver.employeeId,
        teamId: approver.teamId,
        displayName: approver.displayName,
        canViewRequest: approver.canViewRequest,
      })),
    }));

const getStepTasks = (
  approvalRequest: ApprovalRequest,
  step: ApprovalStep,
) => {
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

const ApprovalRequestStepsDialog = () => {
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const [steps, setSteps] = useState<ApprovalStep[]>([]);

  const tenantId = stores.tenantStore.currentTenantId;
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;
  const dialogIsOpen = stores.commonStore.approvalRequestStepsDialogIsOpen;

  useEffect(() => {
    if (!dialogIsOpen) {
      return;
    }

    setSteps(cloneSteps(approvalRequest?.steps ?? []));
    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantId);
      }
    }
  }, [
    dialogIsOpen,
    approvalRequest,
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
  ]);

  const handleClose = () => {
    stores.commonStore.setApprovalRequestStepsDialogIsOpen(false);
  };

  const updateStep = (
    stepIndex: number,
    updater: (step: ApprovalStep) => ApprovalStep,
  ) => {
    setSteps((current) =>
      current.map((step, index) =>
        index === stepIndex ? updater(step) : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((current) => [...current, emptyStep(current.length + 1)]);
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
      approvers: [...step.approvers, emptyApprover()],
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
      approvers:
        step.approvers.length === 1
          ? step.approvers
          : step.approvers.filter((_, index) => index !== approverIndex),
    }));
  };

  const validateSteps = () => {
    const emails = steps.flatMap((step) =>
      step.approvers
        .filter((approver) => approver.type === ApprovalRecipientType.Email)
        .map((approver) => approver.email ?? ""),
    );
    const hasMissingRecipient = steps.some((step) =>
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!approvalRequest || !validateSteps()) {
      return;
    }

    if (await updateApprovalRequestSteps(approvalRequest.id, steps)) {
      stores.commonStore.setApprovalRequestStepsDialogIsOpen(false);
      stores.commonStore.setApprovalRequestViewDialogIsOpen(false);
      stores.approvalRequestStore.setCurrent(null);
      stores.approvalRequestStore.clear();
      stores.approvalRequestStore.load();
      stores.approvalRequestTaskStore.loadUncompletedCount();
      toast.success("Approval steps updated.");
    }
  };

  const lockInfo = approvalRequest ? getLockInfo(approvalRequest) : null;

  return (
    <Dialog
      open={stores.commonStore.approvalRequestStepsDialogIsOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
    >
      <DialogTitle>Edit approval steps</DialogTitle>
      <DialogContent>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.contentStackSx}>
          {steps.map((step, stepIndex) => {
            const persistedStep = approvalRequest?.steps.find(
              (item) => item.id === step.id,
            );
            const stepTasks =
              approvalRequest && persistedStep
                ? getStepTasks(approvalRequest, persistedStep)
                : [];
            const isPassed = Boolean(persistedStep && stepHasPassed(stepTasks));
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

            return (
              <Box
                key={step.id ?? `new-${step.sequence}`}
                sx={getApprovalStepSx(isPassed)}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={Dialogs.stepHeaderSpacing}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={Dialogs.stepHeaderSx}
                >
                  <Typography variant="subtitle1" sx={Dialogs.stepTitleSx}>
                    Step {step.sequence}
                  </Typography>
                  {isPassed && <Chip label="Locked" size="small" />}
                  {isCurrent && (
                    <Chip label="Current" size="small" color="warning" />
                  )}
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={step.mode}
                    onChange={(_, value) => {
                      if (value !== null) {
                        updateStep(stepIndex, (current) => ({
                          ...current,
                          mode: value,
                        }));
                      }
                    }}
                    disabled={isPassed || isCurrent}
                  >
                    <ToggleButton value={ApprovalStepMode.Any}>
                      Any
                    </ToggleButton>
                    <ToggleButton value={ApprovalStepMode.All}>
                      All
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Stack direction="row" spacing={Dialogs.stepActionSpacing}>
                    <Tooltip title="Move step up">
                      <span>
                        <IconButton
                          disabled={!canMoveUp}
                          onClick={() => moveStep(stepIndex, -1)}
                        >
                          <KeyboardArrowUp />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move step down">
                      <span>
                        <IconButton
                          disabled={!canMoveDown}
                          onClick={() => moveStep(stepIndex, 1)}
                        >
                          <KeyboardArrowDown />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Tooltip title="Remove step">
                    <span>
                      <IconButton
                        aria-label={`Remove step ${step.sequence}`}
                        disabled={steps.length === 1 || isPassed || isCurrent}
                        onClick={() => removeStep(stepIndex)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Stack spacing={Dialogs.approverStackSpacing}>
                  {step.approvers.map((approver, approverIndex) => {
                    const approverTasks = getApproverTasks(
                      stepTasks,
                      approver.id,
                    );
                    const existingCurrentApprover =
                      isCurrent && Boolean(approver.id);
                    const touched = approverTasks.some(
                      (task) =>
                        task.status !== ApprovalRequestTaskStatus.Pending,
                    );
                    const disabled = isPassed || existingCurrentApprover;
                    const removeDisabled =
                      isPassed ||
                      (isCurrent && touched) ||
                      (!isCurrent && disabled) ||
                      step.approvers.length === 1;

                    return (
                      <ApprovalStepApproverRow
                        key={approver.id ?? approverIndex}
                        approver={approver}
                        canUseEmployees={canUseEmployees}
                        canUseTeams={canUseTeams}
                        employees={stores.employeeStore.employees}
                        teams={stores.teamStore.teams}
                        disabled={disabled}
                        removeDisabled={removeDisabled}
                        muted={isPassed || touched}
                        onChange={(nextApprover) =>
                          updateApprover(stepIndex, approverIndex, nextApprover)
                        }
                        onRemove={() =>
                          removeApprover(stepIndex, approverIndex)
                        }
                      />
                    );
                  })}
                </Stack>
                <Button
                  startIcon={<Add />}
                  onClick={() => addApprover(stepIndex)}
                  disabled={isPassed}
                >
                  Add approver
                </Button>
              </Box>
            );
          })}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={addStep}
          sx={Dialogs.addStepButtonSx}
        >
          Add step
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestStepsDialog);
