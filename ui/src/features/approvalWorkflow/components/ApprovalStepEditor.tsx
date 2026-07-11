import ApprovalStepApproverRow from "@/features/approvalWorkflow/components/ApprovalStepApproverRow";
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
  teams: { id: number; name: string }[];
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
const addButtonSx: SxProps<Theme> = { alignSelf: "flex-start" };
const stepAddButtonSx: SxProps<Theme> = {
  ...Dialogs.addStepButtonSx,
  alignSelf: "flex-start",
};

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
              key={step.id ?? `new-${step.sequence}`}
              sx={state.sx}
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
                        color="error"
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
                  variant="standard"
                  value={step.mode}
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
                        <ApprovalStepApproverRow
                          key={approver.id ?? approverIndex}
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
