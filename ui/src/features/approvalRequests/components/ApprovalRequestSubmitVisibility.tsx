import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestParticipantLine, {
  getAssigneeIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestSubmitActions from "@/features/approvalRequests/components/ApprovalRequestSubmitActions";
import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import { getApprovalRequestAssigneeVisibilityKey } from "@/features/approvalRequests/utils/approvalRequestVisibility";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import { ApprovalStep, ApprovalStepAssignee, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { Employee } from "@/features/employees/models/employee";
import { Team } from "@/features/teams/models/team";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs } from "@/shared/constants/constants";
import {
  Autocomplete,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { Dispatch, SetStateAction } from "react";

export type StepVisibilityMode = "all" | "allExcept" | "selected" | "assignees";

interface RequestAssigneeOption {
  assigneeIndex: number;
  key: string;
  label: string;
  stepSequence: number;
  type: AssigneeType;
}

interface ApprovalRequestSubmitVisibilityProps {
  canUseEmployees: boolean;
  canUseTeams: boolean;
  description: string;
  employees: Employee[];
  getDisplayStep: (step: EditableApprovalStep) => ApprovalStep;
  isSubmitting: boolean;
  requestFiles: ApprovalRequestFile[];
  showAttachmentRequirement: boolean;
  stepVisibility: Record<string, boolean>;
  stepVisibilityModes: Record<number, StepVisibilityMode>;
  steps: EditableApprovalStep[];
  teams: Team[];
  title: string;
  onBack: () => void;
  onStepVisibilityChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onStepVisibilityModesChange: Dispatch<SetStateAction<Record<number, StepVisibilityMode>>>;
  onSubmit: () => void;
}

const visibilityMobileModeOptionsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  display: "flex",
  flexDirection: "column",
};
const visibilityMobileModeOptionSx: SxProps<Theme> = {
  alignItems: "center",
};
const visibilityModeOptions: { label: string; value: StepVisibilityMode }[] = [
  { label: "All participants", value: "all" },
  { label: "All participants except selected", value: "allExcept" },
  { label: "Assignees and selected participants", value: "selected" },
  { label: "Assignees only", value: "assignees" },
];

const ApprovalRequestSubmitVisibility: React.FC<ApprovalRequestSubmitVisibilityProps> = ({
  canUseEmployees,
  canUseTeams,
  description,
  employees,
  getDisplayStep,
  isSubmitting,
  requestFiles,
  showAttachmentRequirement,
  stepVisibility,
  stepVisibilityModes,
  steps,
  teams,
  title,
  onBack,
  onStepVisibilityChange,
  onStepVisibilityModesChange,
  onSubmit,
}) => {
  const getAssigneeOptionKey = (assignee: ApprovalStepAssignee) => {
    switch (assignee.type) {
      case AssigneeType.Employee:
        return `employee:${assignee.employeeGlobalId ?? assignee.displayName ?? ""}`;
      case AssigneeType.Team:
        return `team:${assignee.teamGlobalId ?? assignee.displayName ?? ""}`;
      default:
        return `user:${assignee.email?.trim().toLowerCase() ?? assignee.displayName ?? ""}`;
    }
  };

  const getAssigneeLabel = (assignee: ApprovalStepAssignee) => {
    if (assignee.displayName) {
      return assignee.displayName;
    }
    if (assignee.type === AssigneeType.Employee) {
      return employees.find((employee) => employee.globalId === assignee.employeeGlobalId)?.displayName ?? "Employee";
    }
    if (assignee.type === AssigneeType.Team) {
      return teams.find((team) => team.globalId === assignee.teamGlobalId)?.name ?? "Team";
    }
    return assignee.email || "Email";
  };

  const requestAssignees = steps.flatMap((step) =>
    step.assignees.map((assignee, assigneeIndex) => ({
      assigneeIndex,
      key: getAssigneeOptionKey(assignee),
      label: getAssigneeLabel(assignee),
      stepSequence: step.sequence,
      type: assignee.type,
    })),
  );

  const getStepVisibilityValue = (stepSequence: number, assigneeStepSequence: number, assigneeIndex: number) =>
    stepVisibility[getApprovalRequestAssigneeVisibilityKey(stepSequence, assigneeStepSequence, assigneeIndex)] ??
    (stepVisibilityModes[stepSequence] ?? "all") === "all";

  const getAdditionalViewerOptions = (stepSequence: number) => {
    const optionKeys = new Set<string>();

    return requestAssignees
      .filter((assignee) => assignee.stepSequence !== stepSequence)
      .filter((assignee) => {
        if (optionKeys.has(assignee.key)) {
          return false;
        }

        optionKeys.add(assignee.key);
        return true;
      })
      .sort((first, second) => first.label.localeCompare(second.label));
  };

  const setVisibleAssignees = (stepSequence: number, assignees: RequestAssigneeOption[]) => {
    const visibleAssigneeKeys = new Set(assignees.map((assignee) => assignee.key));
    onStepVisibilityChange((current) => {
      const next = { ...current };
      requestAssignees.forEach((assignee) => {
        if (assignee.stepSequence !== stepSequence) {
          next[getApprovalRequestAssigneeVisibilityKey(stepSequence, assignee.stepSequence, assignee.assigneeIndex)] =
            visibleAssigneeKeys.has(assignee.key);
        }
      });
      return next;
    });
  };

  const setVisibilityMode = (
    stepSequence: number,
    mode: StepVisibilityMode,
    additionalViewerOptions: RequestAssigneeOption[],
  ) => {
    onStepVisibilityModesChange((current) => ({ ...current, [stepSequence]: mode }));
    setVisibleAssignees(stepSequence, mode === "all" || mode === "allExcept" ? additionalViewerOptions : []);
  };

  return (
    <>
      <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
        <Stack spacing={Dialogs.stepStackSpacing}>
          <ApprovalRequestDetailsCard ariaLabel="Request summary" mode="edit" showStatusBorder={false}>
            <ApprovalRequestSummary
              description={description}
              requestFiles={requestFiles}
              showRevision={false}
              title={title}
            />
          </ApprovalRequestDetailsCard>
          <ApprovalStepEditor
            canUseEmployees={canUseEmployees}
            canUseTeams={canUseTeams}
            compactEmployeeOptions
            employees={employees}
            getStepState={() => ({
              canAddAssignee: false,
              canMoveDown: false,
              canMoveUp: false,
              canRemove: false,
              disabled: true,
            })}
            showAddStep={false}
            showAttachmentRequirement={showAttachmentRequirement}
            steps={steps.map(getDisplayStep)}
            teams={teams}
            onAddAssignee={() => undefined}
            onAddStep={() => undefined}
            onMoveStep={() => undefined}
            onRemoveAssignee={() => undefined}
            onRemoveStep={() => undefined}
            onUpdateAssignee={() => undefined}
            onUpdateStep={() => undefined}
            renderStepFooter={(step, stepIndex) => {
              const additionalViewerOptions = getAdditionalViewerOptions(step.sequence);
              const visibilityMode = stepVisibilityModes[step.sequence] ?? "all";
              const visibleAssignees = additionalViewerOptions.filter((assignee) =>
                getStepVisibilityValue(step.sequence, assignee.stepSequence, assignee.assigneeIndex),
              );
              const hiddenAssignees = additionalViewerOptions.filter(
                (assignee) => !getStepVisibilityValue(step.sequence, assignee.stepSequence, assignee.assigneeIndex),
              );
              const visibilityLabelId = `visibility-label-${stepIndex}`;

              return (
                <Stack spacing={Dialogs.stepHeaderSpacing}>
                  <FormControl>
                    <FormLabel id={visibilityLabelId}>Visibility</FormLabel>
                    <RadioGroup
                      aria-labelledby={visibilityLabelId}
                      row={false}
                      sx={visibilityMobileModeOptionsSx}
                      value={visibilityMode}
                      onChange={(event) =>
                        setVisibilityMode(
                          step.sequence,
                          event.target.value as StepVisibilityMode,
                          additionalViewerOptions,
                        )
                      }
                    >
                      {visibilityModeOptions.map((option) => (
                        <FormControlLabel
                          control={<Radio />}
                          key={option.value}
                          label={<Typography variant="body2">{option.label}</Typography>}
                          sx={visibilityMobileModeOptionSx}
                          value={option.value}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  {(visibilityMode === "selected" || visibilityMode === "allExcept") && (
                    <Autocomplete
                      disableCloseOnSelect
                      filterSelectedOptions
                      getOptionLabel={(option) => `${option.label} (Step ${option.stepSequence})`}
                      isOptionEqualToValue={(option, value) => option.key === value.key}
                      multiple
                      options={additionalViewerOptions}
                      value={visibilityMode === "selected" ? visibleAssignees : hiddenAssignees}
                      onChange={(_, value) => {
                        setVisibleAssignees(
                          step.sequence,
                          visibilityMode === "selected"
                            ? value
                            : additionalViewerOptions.filter(
                                (option) => !value.some((excluded) => excluded.key === option.key),
                              ),
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            visibilityMode === "selected"
                              ? "Additional participants who can view this step"
                              : "Participants who cannot view this step"
                          }
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <ApprovalRequestParticipantLine
                            label={<DisplayName displayName={option.label} showEmailAddress={false} />}
                            type={option.type}
                          />
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            icon={getAssigneeIcon(option.type)}
                            key={option.key}
                            label={option.label}
                          />
                        ))
                      }
                    />
                  )}
                </Stack>
              );
            }}
          />
        </Stack>
      </Stack>
      <ApprovalRequestSubmitActions
        canContinue={false}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ApprovalRequestSubmitVisibility;
