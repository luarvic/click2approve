import { stores } from "@/app/stores";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
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
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalStepTemplateDialogProps {
  open: boolean;
  template: ApprovalStepTemplate | null;
  onClose: () => void;
}

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

const cloneSteps = (steps: ApprovalStep[]) =>
  steps.map((step, index) => ({
    sequence: index + 1,
    mode: step.mode,
    approvers: step.approvers.map((approver) => ({
      type: approver.type,
      email: approver.email,
      employeeId: approver.employeeId,
      teamId: approver.teamId,
      displayName: approver.displayName,
      canViewRequest: approver.canViewRequest,
    })),
  }));

const ApprovalStepTemplateDialog: React.FC<
  ApprovalStepTemplateDialogProps
> = ({ open, template, onClose }) => {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<ApprovalStep[]>([emptyStep(1)]);
  const tenantId = stores.tenantStore.currentTenantId;
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(template?.name ?? "");
    setSteps(template ? cloneSteps(template.steps) : [emptyStep(1)]);
    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantId);
      }
    }
  }, [
    open,
    template,
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
  ]);

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

  const handleSubmit = async () => {
    if (!tenantId) {
      return;
    }
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    const saved = template
      ? await stores.approvalStepTemplateStore.update(tenantId, template.id, {
        name: name.trim(),
        steps,
      })
      : await stores.approvalStepTemplateStore.create(tenantId, {
        name: name.trim(),
        steps,
      });
    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle>
      <DialogContent>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.topSpacingSx}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
          />
          <Stack spacing={Dialogs.stepStackSpacing}>
            {steps.map((step, stepIndex) => (
              <Box key={step.sequence} sx={Dialogs.approvalStepSx}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={Dialogs.stepHeaderSpacing}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={Dialogs.stepHeaderSx}
                >
                  <Box sx={Dialogs.stepTitleSx}>Step {step.sequence}</Box>
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
                          disabled={stepIndex === 0}
                          onClick={() => moveStep(stepIndex, -1)}
                        >
                          <KeyboardArrowUp />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move step down">
                      <span>
                        <IconButton
                          disabled={stepIndex === steps.length - 1}
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
                        disabled={steps.length === 1}
                        onClick={() => removeStep(stepIndex)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Stack spacing={Dialogs.approverStackSpacing}>
                  {step.approvers.map((approver, approverIndex) => (
                    <ApprovalStepApproverRow
                      key={approverIndex}
                      approver={approver}
                      canUseEmployees={canUseEmployees}
                      canUseTeams={canUseTeams}
                      employees={stores.employeeStore.employees}
                      teams={stores.teamStore.teams}
                      onChange={(nextApprover) =>
                        updateApprover(stepIndex, approverIndex, nextApprover)
                      }
                      onRemove={() =>
                        updateStep(stepIndex, (current) => ({
                          ...current,
                          approvers:
                            current.approvers.length === 1
                              ? current.approvers
                              : current.approvers.filter(
                                (_, index) => index !== approverIndex,
                              ),
                        }))
                      }
                    />
                  ))}
                </Stack>
                <Button
                  startIcon={<Add />}
                  onClick={() =>
                    updateStep(stepIndex, (current) => ({
                      ...current,
                      approvers: [...current.approvers, emptyApprover()],
                    }))
                  }
                >
                  Add approver
                </Button>
              </Box>
            ))}
          </Stack>
          <Button startIcon={<Add />} onClick={addStep}>
            Add step
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalStepTemplateDialog;
