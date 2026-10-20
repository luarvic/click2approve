import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import ApprovalStepAssigneeRow from "@/features/approvalWorkflow/components/ApprovalStepAssigneeRow";
import ApprovalStepList from "@/features/approvalWorkflow/components/ApprovalStepList";
import ApprovalStepSection from "@/features/approvalWorkflow/components/ApprovalStepSection";
import { ApprovalStepStyles } from "@/features/approvalWorkflow/components/approvalStepStyles";
import {
  ApprovalStepAssignee,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { Employee } from "@/features/employees/models/employee";
import FormSection from "@/shared/components/forms/FormSection";
import { Flex } from "@/shared/components/layout/flexStyles";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import AppCard from "@/shared/components/papers/AppCard";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { textRule } from "@/shared/utils/formValidation";
import { Add, DeleteOutlined, North, South } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Button,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useId, type ReactNode } from "react";

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
  stepErrors?: (string | undefined)[];
  getAssigneeError?: (assignee: ApprovalStepAssignee) => string | undefined;
  steps: EditableApprovalStep[];
  canUseEmployees: boolean;
  canUseTeams: boolean;
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
  renderStepFooter?: (step: EditableApprovalStep, stepIndex: number) => ReactNode;
  showAttachmentRequirement?: boolean;
  showOrganizationEmployeesVisibility?: boolean;
}

const stepAddButtonSx: SxProps<Theme> = {
  ...ApprovalStepStyles.addStepButtonSx,
  alignSelf: "flex-start",
};
const actionOptions = [
  { value: ApprovalRequestTaskAction.Accept, label: "Accept" },
  { value: ApprovalRequestTaskAction.Acknowledge, label: "Acknowledge" },
  { value: ApprovalRequestTaskAction.Approve, label: "Approve" },
  { value: ApprovalRequestTaskAction.Complete, label: "Complete" },
  { value: ApprovalRequestTaskAction.Confirm, label: "Confirm" },
  { value: ApprovalRequestTaskAction.Review, label: "Review" },
  { value: ApprovalRequestTaskAction.Sign, label: "Sign" },
  { value: ApprovalRequestTaskAction.Verify, label: "Verify" },
];
const stepOptionLabelSx: SxProps<Theme> = { ml: 0, mr: 0, minHeight: 44 };
const stepOptionsSx: SxProps<Theme> = {
  "& .MuiFormControlLabel-root": stepOptionLabelSx,
};

const ApprovalStepEditor: React.FC<ApprovalStepEditorProps> = ({
  steps,
  stepErrors,
  getAssigneeError,
  canUseEmployees,
  canUseTeams,
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
  renderStepFooter,
  showAttachmentRequirement = false,
  showOrganizationEmployeesVisibility = false,
}) => {
  const editorId = useId();

  return (
    <>
      {steps.length > 0 && (
        <ApprovalStepList>
          {steps.map((step, stepIndex) => {
            const state = getStepState?.(step, stepIndex) ?? {};
            const disabled = state.disabled ?? false;
            const canMoveUp = state.canMoveUp ?? stepIndex > 0;
            const canMoveDown = state.canMoveDown ?? stepIndex < steps.length - 1;
            const canRemove = state.canRemove ?? !disabled;
            const canAddAssignee = state.canAddAssignee ?? !disabled;
            const showCompletionRule =
              step.assignees.length > 1 || step.assignees.some((assignee) => assignee.type === AssigneeType.Team);

            const visibilityTitleId = `${editorId}-step-${step.sequence}-visibility`;

            return (
              <ApprovalStepSection
                key={step.globalId ?? `new-${step.sequence}`}
                sequence={step.sequence}
                accessory={
                  <>
                    {state.isPassed && <Chip label="Locked" size="small" />}
                    {state.isCurrent && <Chip label="Current" size="small" color="warning" />}
                  </>
                }
                actions={
                  <>
                    {(canMoveUp || canMoveDown) && (
                      <>
                        <Tooltip title="Move step up">
                          <span>
                            <IconButton
                              aria-label={`Move step ${step.sequence} up`}
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
                              aria-label={`Move step ${step.sequence} down`}
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
                          <DeleteOutlined />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                }
              >
                <AppCard aria-label={`Step ${step.sequence}`} sx={state.sx}>
                  <CardContent>
                    <Stack spacing={ApprovalStepStyles.stepStackSpacing}>
                      <TextField
                        select
                        fullWidth
                        label="Action"
                        value={step.action ?? ApprovalRequestTaskAction.Approve}
                        disabled={disabled}
                        onChange={(event) =>
                          onUpdateStep(stepIndex, (current) => ({
                            ...current,
                            action: event.target.value as ApprovalRequestTaskAction,
                          }))
                        }
                      >
                        {actionOptions.map((action) => (
                          <MenuItem key={action.value} value={action.value}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        label="Instructions"
                        error={Boolean(
                          stepErrors && textRule("Instructions", FieldLimits.text)(step.instructions ?? ""),
                        )}
                        helperText={
                          stepErrors ? textRule("Instructions", FieldLimits.text)(step.instructions ?? "") : undefined
                        }
                        multiline
                        value={step.instructions ?? ""}
                        disabled={disabled}
                        onChange={(event) =>
                          onUpdateStep(stepIndex, (current) => ({ ...current, instructions: event.target.value }))
                        }
                      />
                      <Stack spacing={ApprovalStepStyles.assigneeStackSpacing}>
                        {stepErrors?.[stepIndex] && (
                          <FormHelperText
                            error
                            role="alert"
                            tabIndex={-1}
                            data-validation-error={step.assignees.length === 0 ? true : undefined}
                          >
                            {stepErrors[stepIndex]}
                          </FormHelperText>
                        )}
                        {step.assignees.map((assignee, assigneeIndex) => {
                          const assigneeState = getAssigneeState?.(step, stepIndex, assignee, assigneeIndex) ?? {};

                          return (
                            <ApprovalStepAssigneeRow
                              assignee={assignee}
                              error={getAssigneeError?.(assignee)}
                              canUseEmployees={canUseEmployees}
                              canUseTeams={canUseTeams}
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
                        })}
                      </Stack>
                      {showCompletionRule && (
                        <FormControlLabel
                          sx={stepOptionLabelSx}
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
                            <Stack direction="row" sx={Flex.alignCenterSx}>
                              All assignees must complete
                              <HelpPopover
                                docsHref="/docs/workflow-steps/"
                                helpText="Require every assignee to act; when disabled, any assignee can satisfy the step."
                              />
                            </Stack>
                          }
                        />
                      )}
                      <Button
                        startIcon={<Add />}
                        disabled={!canAddAssignee}
                        onClick={() => onAddAssignee(stepIndex)}
                        sx={Flex.alignSelfStartSx}
                      >
                        Add assignee
                      </Button>
                      <FormSection title="Additional requirements">
                        <Stack sx={stepOptionsSx}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={step.isElectronicSignatureRequired ?? false}
                                disabled={disabled}
                                onChange={(_, checked) =>
                                  onUpdateStep(stepIndex, (current) => ({
                                    ...current,
                                    isElectronicSignatureRequired: checked,
                                  }))
                                }
                              />
                            }
                            label="Require an electronic signature"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={step.isCommentRequired ?? false}
                                disabled={disabled}
                                onChange={(_, checked) =>
                                  onUpdateStep(stepIndex, (current) => ({ ...current, isCommentRequired: checked }))
                                }
                              />
                            }
                            label="Require a comment"
                          />
                          {showAttachmentRequirement && (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={step.isAttachmentRequired ?? false}
                                  disabled={disabled}
                                  onChange={(_, checked) =>
                                    onUpdateStep(stepIndex, (current) => ({
                                      ...current,
                                      isAttachmentRequired: checked,
                                    }))
                                  }
                                />
                              }
                              label="Require an attachment"
                            />
                          )}
                        </Stack>
                      </FormSection>
                      <FormSection title="Visibility" titleId={visibilityTitleId}>
                        <FormControl disabled={disabled} sx={stepOptionsSx}>
                          <RadioGroup
                            aria-labelledby={visibilityTitleId}
                            value={step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants}
                            onChange={(event) =>
                              onUpdateStep(stepIndex, (current) => ({
                                ...current,
                                visibilityMode: event.target.value as ApprovalStepVisibilityMode,
                              }))
                            }
                          >
                            <FormControlLabel
                              control={<Radio />}
                              label="All participants"
                              value={ApprovalStepVisibilityMode.AllParticipants}
                            />
                            {showOrganizationEmployeesVisibility && (
                              <FormControlLabel
                                control={<Radio />}
                                label="Organization employees"
                                value={ApprovalStepVisibilityMode.OrganizationEmployees}
                              />
                            )}
                            <FormControlLabel
                              control={<Radio />}
                              label="Assignees only"
                              value={ApprovalStepVisibilityMode.AssigneesOnly}
                            />
                          </RadioGroup>
                        </FormControl>
                      </FormSection>
                      {renderStepFooter?.(step, stepIndex)}
                    </Stack>
                  </CardContent>
                </AppCard>
              </ApprovalStepSection>
            );
          })}
        </ApprovalStepList>
      )}
      {showAddStep && (
        <Button startIcon={<Add />} onClick={onAddStep} sx={stepAddButtonSx}>
          Add step
        </Button>
      )}
    </>
  );
};

export default ApprovalStepEditor;
