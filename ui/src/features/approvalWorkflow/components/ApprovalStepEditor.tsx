import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalStepAssigneeRow from "@/features/approvalWorkflow/components/ApprovalStepAssigneeRow";
import ApprovalStepTitle from "@/features/approvalWorkflow/components/ApprovalStepTitle";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { AssigneeType, ApprovalStepAssignee, ApprovalStepMode } from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { Employee } from "@/features/employees/models/employee";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { Dialogs, Icons } from "@/shared/constants/constants";
import { Add, AccountTreeOutlined, DeleteOutline, North, South } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepEditorStepState {
  canAddAssignee?: boolean;
  canMoveDown?: boolean;
  canMoveUp?: boolean;
  canRemove?: boolean;
  disabled?: boolean;
  isCurrent?: boolean;
  isPassed?: boolean;
  sx?: SxProps<Theme>;
}

interface ApprovalStepEditorAssigneeState {
  disabled?: boolean;
  muted?: boolean;
  removeDisabled?: boolean;
}

interface ApprovalStepEditorProps {
  steps: EditableApprovalStep[];
  canUseEmployees: boolean;
  canUseTeams: boolean;
  compactEmployeeOptions?: boolean;
  employees: Employee[];
  teams: { globalId: string; name: string }[];
  getStepState?: (step: EditableApprovalStep, stepIndex: number) => ApprovalStepEditorStepState;
  getAssigneeState?: (
    step: EditableApprovalStep,
    stepIndex: number,
    assignee: ApprovalStepAssignee,
    assigneeIndex: number,
  ) => ApprovalStepEditorAssigneeState;
  onAddAssignee: (stepIndex: number) => void;
  onAddStep: () => void;
  showAddStep?: boolean;
  stackAssigneeControlsOnSmallScreens?: boolean;
  onMoveStep: (stepIndex: number, direction: -1 | 1) => void;
  onRemoveAssignee: (stepIndex: number, assigneeIndex: number) => void;
  onRemoveStep: (stepIndex: number) => void;
  onUpdateAssignee: (stepIndex: number, assigneeIndex: number, assignee: ApprovalStepAssignee) => void;
  onUpdateStep: (stepIndex: number, updater: (step: EditableApprovalStep) => EditableApprovalStep) => void;
}

const stepContentSx: SxProps<Theme> = { pr: 0 };
const stepLabelSx: SxProps<Theme> = {
  "& .MuiStepLabel-label, & .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: "text.primary",
  },
};
const stepLabelContentSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flex: 1,
  flexWrap: "wrap",
  gap: Dialogs.stepHeaderSpacing,
};
const stepLabelActionsSx: SxProps<Theme> = {
  display: "flex",
  gap: Dialogs.stepActionSpacing,
  marginLeft: "auto",
};
const addButtonSx: SxProps<Theme> = { alignSelf: "flex-start" };
const stepAddButtonSx: SxProps<Theme> = {
  ...Dialogs.addStepButtonSx,
  alignSelf: "flex-start",
};
const actionOptions = [
  { value: ApprovalRequestTaskAction.Approve, label: "Approve" },
  { value: ApprovalRequestTaskAction.Sign, label: "Sign" },
  { value: ApprovalRequestTaskAction.Confirm, label: "Confirm" },
  { value: ApprovalRequestTaskAction.Acknowledge, label: "Acknowledge" },
  { value: ApprovalRequestTaskAction.Review, label: "Review" },
  { value: ApprovalRequestTaskAction.Verify, label: "Verify" },
  { value: ApprovalRequestTaskAction.Accept, label: "Accept" },
  { value: ApprovalRequestTaskAction.Complete, label: "Complete" },
];
const getStepContentSx = (sx?: SxProps<Theme>): SxProps<Theme> => (sx ? (Array.isArray(sx) ? sx : [sx]) : []);

const EditableStepIcon = () => <AccountTreeOutlined color={Icons.secondaryColor} fontSize="small" />;

const ApprovalStepEditor: React.FC<ApprovalStepEditorProps> = ({
  steps,
  canUseEmployees,
  canUseTeams,
  compactEmployeeOptions = false,
  employees,
  teams,
  getAssigneeState,
  getStepState,
  onAddAssignee,
  onAddStep,
  showAddStep = true,
  stackAssigneeControlsOnSmallScreens = false,
  onMoveStep,
  onRemoveAssignee,
  onRemoveStep,
  onUpdateAssignee,
  onUpdateStep,
}) => (
  <>
    {steps.length > 0 && (
      <Stepper activeStep={-1} nonLinear orientation="vertical">
        {steps.map((step, stepIndex) => {
          const state = getStepState?.(step, stepIndex) ?? {};
          const disabled = state.disabled ?? false;
          const canMoveUp = state.canMoveUp ?? stepIndex > 0;
          const canMoveDown = state.canMoveDown ?? stepIndex < steps.length - 1;
          const canRemove = state.canRemove ?? !disabled;
          const canAddAssignee = state.canAddAssignee ?? !disabled;
          const showCompletionRule =
            step.assignees.length > 1 || step.assignees.some((assignee) => assignee.type === AssigneeType.Team);

          return (
            <Step expanded key={step.globalId ?? `new-${step.sequence}`}>
              <StepLabel StepIconComponent={EditableStepIcon} sx={stepLabelSx}>
                <Box sx={stepLabelContentSx}>
                  <ApprovalStepTitle sequence={step.sequence} />
                  {state.isPassed && <Chip label="Locked" size="small" />}
                  {state.isCurrent && <Chip label="Current" size="small" color="warning" />}
                  <Box sx={stepLabelActionsSx}>
                    {(canMoveUp || canMoveDown) && (
                      <>
                        <Tooltip title="Move step up">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={!canMoveUp}
                              onClick={(event) => {
                                event.stopPropagation();
                                onMoveStep(stepIndex, -1);
                              }}
                            >
                              <North />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move step down">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={!canMoveDown}
                              onClick={(event) => {
                                event.stopPropagation();
                                onMoveStep(stepIndex, 1);
                              }}
                            >
                              <South />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Remove step">
                      <span>
                        <IconButton
                          aria-label={`Remove step ${step.sequence}`}
                          disabled={!canRemove}
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemoveStep(stepIndex);
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </StepLabel>
              <StepContent sx={stepContentSx} TransitionProps={{ in: true, unmountOnExit: false }}>
                <ApprovalRequestDetailsCard
                  ariaLabel={`Step ${step.sequence}`}
                  showStatusBorder={false}
                  sx={getStepContentSx(state.sx)}
                >
                  <Stack spacing={Dialogs.stepStackSpacing}>
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
                    <Stack spacing={Dialogs.assigneeStackSpacing}>
                      {step.assignees.map((assignee, assigneeIndex) =>
                        (() => {
                          const assigneeState = getAssigneeState?.(step, stepIndex, assignee, assigneeIndex) ?? {};
                          return (
                            <ApprovalStepAssigneeRow
                              assignee={assignee}
                              canUseEmployees={canUseEmployees}
                              canUseTeams={canUseTeams}
                              compactEmployeeOptions={compactEmployeeOptions}
                              disabled={assigneeState.disabled ?? disabled}
                              employees={employees}
                              key={assignee.globalId ?? assigneeIndex}
                              muted={assigneeState.muted ?? state.isPassed ?? false}
                              removeDisabled={assigneeState.removeDisabled ?? disabled}
                              teams={teams}
                              stackControlsOnSmallScreens={stackAssigneeControlsOnSmallScreens}
                              onChange={(nextAssignee) => onUpdateAssignee(stepIndex, assigneeIndex, nextAssignee)}
                              onRemove={() => onRemoveAssignee(stepIndex, assigneeIndex)}
                            />
                          );
                        })(),
                      )}
                    </Stack>
                    {showCompletionRule && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={(step.mode ?? ApprovalStepMode.Any) === ApprovalStepMode.All}
                            disabled={disabled}
                            onChange={(_, checked) =>
                              onUpdateStep(stepIndex, (current) => ({
                                ...current,
                                mode: checked ? ApprovalStepMode.All : ApprovalStepMode.Any,
                              }))
                            }
                          />
                        }
                        label={
                          <Stack alignItems="center" direction="row">
                            All assignees must complete
                            <HelpPopover helpText="When disabled, any assignee can complete this step." />
                          </Stack>
                        }
                      />
                    )}
                    <Button
                      startIcon={<Add />}
                      disabled={!canAddAssignee}
                      onClick={() => onAddAssignee(stepIndex)}
                      sx={addButtonSx}
                    >
                      Add assignee
                    </Button>
                  </Stack>
                </ApprovalRequestDetailsCard>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    )}
    {showAddStep && (
      <Button startIcon={<Add />} onClick={onAddStep} sx={stepAddButtonSx}>
        Add step
      </Button>
    )}
  </>
);

export default ApprovalStepEditor;
