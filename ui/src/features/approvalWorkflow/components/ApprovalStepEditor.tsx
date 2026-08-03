import ApprovalStepApproverRow from "@/features/approvalWorkflow/components/ApprovalStepApproverRow";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { Employee } from "@/features/employees/models/employee";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Dialogs } from "@/shared/constants/constants";
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
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepEditorStepState {
  canAddApprover?: boolean;
  canMoveDown?: boolean;
  canMoveUp?: boolean;
  canRemove?: boolean;
  disabled?: boolean;
  isCurrent?: boolean;
  isPassed?: boolean;
  sx?: SxProps<Theme>;
}

interface ApprovalStepEditorApproverState {
  disabled?: boolean;
  muted?: boolean;
  removeDisabled?: boolean;
}

interface ApprovalStepEditorProps {
  steps: EditableApprovalStep[];
  canUseEmployees: boolean;
  canUseTeams: boolean;
  employees: Employee[];
  teams: { globalId: string; name: string }[];
  getStepState?: (
    step: EditableApprovalStep,
    stepIndex: number,
  ) => ApprovalStepEditorStepState;
  getApproverState?: (
    step: EditableApprovalStep,
    stepIndex: number,
    approver: ApprovalStepApprover,
    approverIndex: number,
  ) => ApprovalStepEditorApproverState;
  onAddApprover: (stepIndex: number) => void;
  onAddStep: () => void;
  showAddStep?: boolean;
  onMoveStep: (stepIndex: number, direction: -1 | 1) => void;
  onRemoveApprover: (stepIndex: number, approverIndex: number) => void;
  onRemoveStep: (stepIndex: number) => void;
  onUpdateApprover: (
    stepIndex: number,
    approverIndex: number,
    approver: ApprovalStepApprover,
  ) => void;
  onUpdateStep: (
    stepIndex: number,
    updater: (step: EditableApprovalStep) => EditableApprovalStep,
  ) => void;
}

const stepHeaderSx: SxProps<Theme> = { flexWrap: "nowrap" };
const stepTitleSx: SxProps<Theme> = { flexShrink: 0 };
const stepHeaderSpacerSx: SxProps<Theme> = { flexGrow: 1 };
const stepContainerSx: SxProps<Theme> = {
  bgcolor: "action.hover",
  borderRadius: 1,
  p: Dialogs.stepStackSpacing,
};
const addButtonSx: SxProps<Theme> = { alignSelf: "flex-start" };
const stepAddButtonSx: SxProps<Theme> = {
  ...Dialogs.addStepButtonSx,
  alignSelf: "flex-start",
};
const approverBoxSx: SxProps<Theme> = { ...Dialogs.approvalBoxSx };
const actionOptions = [
  { value: ApprovalRequestTaskAction.Approve, label: "Approve" },
  { value: ApprovalRequestTaskAction.Sign, label: "Sign" },
  { value: ApprovalRequestTaskAction.Confirm, label: "Confirm" },
  { value: ApprovalRequestTaskAction.Acknowledge, label: "Acknowledge" },
];
const getStepContainerSx = (sx?: SxProps<Theme>): SxProps<Theme> => [
  stepContainerSx,
  ...(Array.isArray(sx) ? sx : [sx]),
];

const ApprovalStepEditor: React.FC<ApprovalStepEditorProps> = ({
  steps,
  canUseEmployees,
  canUseTeams,
  employees,
  teams,
  getApproverState,
  getStepState,
  onAddApprover,
  onAddStep,
  showAddStep = true,
  onMoveStep,
  onRemoveApprover,
  onRemoveStep,
  onUpdateApprover,
  onUpdateStep,
}) => (
  <>
    {steps.length > 0 && (
      <Stack spacing={Dialogs.stepStackSpacing}>
        {steps.map((step, stepIndex) => {
          const state = getStepState?.(step, stepIndex) ?? {};
          const disabled = state.disabled ?? false;
          const canMoveUp = state.canMoveUp ?? stepIndex > 0;
          const canMoveDown = state.canMoveDown ?? stepIndex < steps.length - 1;
          const canRemove = state.canRemove ?? !disabled;
          const canAddApprover = state.canAddApprover ?? !disabled;

          return (
            <CommentPaper
              key={step.globalId ?? `new-${step.sequence}`}
              sx={getStepContainerSx(state.sx)}
            >
              <Stack spacing={Dialogs.stepStackSpacing}>
                <Stack
                  direction="row"
                  spacing={Dialogs.stepHeaderSpacing}
                  alignItems="center"
                  sx={stepHeaderSx}
                >
                  <Typography variant="subtitle1" sx={stepTitleSx}>
                    Step {step.sequence}
                  </Typography>
                  {(canMoveUp || canMoveDown) && (
                    <Stack direction="row" spacing={Dialogs.stepActionSpacing}>
                      <Tooltip title="Move step up">
                        <span>
                          <IconButton
                            color="primary"
                            disabled={!canMoveUp}
                            onClick={() => onMoveStep(stepIndex, -1)}
                          >
                            <KeyboardArrowUp />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move step down">
                        <span>
                          <IconButton
                            color="primary"
                            disabled={!canMoveDown}
                            onClick={() => onMoveStep(stepIndex, 1)}
                          >
                            <KeyboardArrowDown />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  )}
                  {state.isPassed && <Chip label="Locked" size="small" />}
                  {state.isCurrent && (
                    <Chip label="Current" size="small" color="warning" />
                  )}
                  <Box sx={stepHeaderSpacerSx} />
                  <Tooltip title="Remove step">
                    <span>
                      <IconButton
                        aria-label={`Remove step ${step.sequence}`}
                        disabled={!canRemove}
                        onClick={() => onRemoveStep(stepIndex)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <TextField
                  select
                  fullWidth
                  label="Completion rule"
                  value={step.mode ?? ApprovalStepMode.Any}
                  disabled={disabled}
                  onChange={(event) =>
                    onUpdateStep(stepIndex, (current) => ({
                      ...current,
                      mode: Number(event.target.value) as ApprovalStepMode,
                    }))
                  }
                >
                  <MenuItem value={ApprovalStepMode.Any}>
                    Any assignee can complete
                  </MenuItem>
                  <MenuItem value={ApprovalStepMode.All}>
                    All assignees must complete
                  </MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Action"
                  value={step.action ?? ApprovalRequestTaskAction.Approve}
                  disabled={disabled}
                  onChange={(event) =>
                    onUpdateStep(stepIndex, (current) => ({
                      ...current,
                      action: Number(event.target.value) as ApprovalRequestTaskAction,
                    }))
                  }
                >
                  {actionOptions.map((action) => (
                    <MenuItem key={action.value} value={action.value}>
                      {action.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack spacing={Dialogs.approverStackSpacing}>
                  {step.approvers.map((approver, approverIndex) =>
                    (() => {
                      const approverState =
                        getApproverState?.(
                          step,
                          stepIndex,
                          approver,
                          approverIndex,
                        ) ?? {};
                      return (
                        <Box
                          key={approver.globalId ?? approverIndex}
                          sx={approverBoxSx}
                        >
                          <ApprovalStepApproverRow
                            approver={approver}
                            canUseEmployees={canUseEmployees}
                            canUseTeams={canUseTeams}
                            employees={employees}
                            teams={teams}
                            disabled={approverState.disabled ?? disabled}
                            removeDisabled={
                              approverState.removeDisabled ??
                              disabled
                            }
                            muted={approverState.muted ?? state.isPassed ?? false}
                            onChange={(nextApprover) =>
                              onUpdateApprover(
                                stepIndex,
                                approverIndex,
                                nextApprover,
                              )
                            }
                            onRemove={() =>
                              onRemoveApprover(stepIndex, approverIndex)
                            }
                          />
                        </Box>
                      );
                    })(),
                  )}
                </Stack>
                <Button
                  startIcon={<Add />}
                  disabled={!canAddApprover}
                  onClick={() => onAddApprover(stepIndex)}
                  sx={addButtonSx}
                >
                  Add assignee
                </Button>
              </Stack>
            </CommentPaper>
          );
        })}
      </Stack>
    )}
    {showAddStep && (
      <Button
        startIcon={<Add />}
        onClick={onAddStep}
        sx={stepAddButtonSx}
      >
        Add step
      </Button>
    )}
  </>
);

export default ApprovalStepEditor;
