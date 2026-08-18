import { stores } from "@/app/rootStore";
import ApprovalRequestParticipantChip from "@/features/approvalRequests/components/ApprovalRequestParticipantChip";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  ApprovalStep,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Dialogs } from "@/shared/constants/constants";
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type VisibilityMode = "all" | "allExcept" | "selected" | "assignees";

interface AssigneeOption {
  globalId: string;
  label: string;
  type: AssigneeType;
}

interface ApprovalStepTemplateVisibilityEditorProps {
  steps: ApprovalStep[];
  onUpdateStep: (stepIndex: number, step: ApprovalStep) => void;
}

const visibilityModes: Record<VisibilityMode, ApprovalStepVisibilityMode> = {
  all: ApprovalStepVisibilityMode.AllParticipants,
  allExcept: ApprovalStepVisibilityMode.AllParticipantsExceptSelected,
  assignees: ApprovalStepVisibilityMode.AssigneesOnly,
  selected: ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants,
};
const visibilityModeValues: Record<ApprovalStepVisibilityMode, VisibilityMode> = {
  [ApprovalStepVisibilityMode.AllParticipants]: "all",
  [ApprovalStepVisibilityMode.AllParticipantsExceptSelected]: "allExcept",
  [ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants]: "selected",
  [ApprovalStepVisibilityMode.AssigneesOnly]: "assignees",
};
const options: { label: string; value: VisibilityMode }[] = [
  { label: "All participants", value: "all" },
  { label: "All participants except selected", value: "allExcept" },
  { label: "Assignees and selected participants", value: "selected" },
  { label: "Assignees only", value: "assignees" },
];
const mobileModeOptionsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  display: "flex",
  flexDirection: "column",
};
const ApprovalStepTemplateVisibilityEditor: React.FC<ApprovalStepTemplateVisibilityEditorProps> = ({
  steps,
  onUpdateStep,
}) => {
  const getDisplayAssignee = (assignee: ApprovalStep["assignees"][number]) => {
    if (assignee.type === AssigneeType.Employee) {
      const employee = stores.employeeStore.employees.find((item) => item.globalId === assignee.employeeGlobalId);
      return {
        ...assignee,
        displayName: assignee.displayName ?? employee?.displayName,
        email: assignee.email ?? employee?.email,
      };
    }
    if (assignee.type === AssigneeType.Team) {
      const team = stores.teamStore.teams.find((item) => item.globalId === assignee.teamGlobalId);
      return { ...assignee, displayName: assignee.displayName ?? team?.name };
    }
    return assignee;
  };
  const getDisplayStep = (step: ApprovalStep): ApprovalStep => ({
    ...step,
    assignees: step.assignees.map(getDisplayAssignee),
  });
  const allAssignees = steps.flatMap((step) =>
    step.assignees.flatMap((assignee) =>
      assignee.globalId
        ? [
            {
              globalId: assignee.globalId,
              label: getDisplayAssignee(assignee).displayName ?? assignee.email ?? "Assignee",
              type: assignee.type,
            },
          ]
        : [],
    ),
  );

  const updateVisibility = (stepIndex: number, mode: VisibilityMode, selectedAssignees: AssigneeOption[]) => {
    const step = steps[stepIndex];
    const ownAssigneeIds = new Set(step.assignees.map((assignee) => assignee.globalId));
    const selectedAssigneeIds = new Set(selectedAssignees.map((assignee) => assignee.globalId));
    const visibility = allAssignees.map((assignee) => ({
      assigneeGlobalId: assignee.globalId,
      assigneeType: assignee.type,
      isVisible:
        ownAssigneeIds.has(assignee.globalId) ||
        (mode === "all" || mode === "allExcept"
          ? !selectedAssigneeIds.has(assignee.globalId)
          : selectedAssigneeIds.has(assignee.globalId)),
    }));
    onUpdateStep(stepIndex, {
      ...step,
      visibility,
      visibilityMode: visibilityModes[mode],
    });
  };

  return (
    <ApprovalStepEditor
      canUseEmployees
      canUseTeams
      employees={stores.employeeStore.employees}
      getStepState={() => ({
        canAddAssignee: false,
        canMoveDown: false,
        canMoveUp: false,
        canRemove: false,
        disabled: true,
      })}
      onAddAssignee={() => undefined}
      onAddStep={() => undefined}
      onMoveStep={() => undefined}
      onRemoveAssignee={() => undefined}
      onRemoveStep={() => undefined}
      onUpdateAssignee={() => undefined}
      onUpdateStep={() => undefined}
      renderStepFooter={(step, stepIndex) => {
        const mode = visibilityModeValues[step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants];
        const visibilityLabelId = `visibility-label-${stepIndex}`;
        const ownAssigneeIds = new Set(step.assignees.map((assignee) => assignee.globalId));
        const additionalAssignees = allAssignees.filter((assignee) => !ownAssigneeIds.has(assignee.globalId));
        const selectedAssignees = additionalAssignees.filter((assignee) => {
          const isVisible =
            step.visibility?.find((visibility) => visibility.assigneeGlobalId === assignee.globalId)?.isVisible ??
            (mode === "all" || mode === "allExcept");
          return mode === "allExcept" ? !isVisible : isVisible;
        });

        return (
          <Stack spacing={Dialogs.stepHeaderSpacing}>
            <FormControl>
              <FormLabel id={visibilityLabelId}>Visibility</FormLabel>
              <RadioGroup
                aria-labelledby={visibilityLabelId}
                row={false}
                sx={mobileModeOptionsSx}
                value={mode}
                onChange={(event) => updateVisibility(stepIndex, event.target.value as VisibilityMode, [])}
              >
                {options.map((option) => (
                  <FormControlLabel control={<Radio />} key={option.value} label={option.label} value={option.value} />
                ))}
              </RadioGroup>
            </FormControl>
            {(mode === "selected" || mode === "allExcept") && (
              <Autocomplete
                multiple
                filterSelectedOptions
                options={additionalAssignees}
                value={selectedAssignees}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
                onChange={(_, value) => updateVisibility(stepIndex, mode, value)}
                renderOption={(props, option) => (
                  <li {...props}>
                    <ApprovalRequestParticipantLine displayName={option.label} type={option.type} />
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <ApprovalRequestParticipantChip
                      {...getTagProps({ index })}
                      displayName={option.label}
                      type={option.type}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      mode === "selected"
                        ? "Additional participants who can view this step"
                        : "Participants who cannot view this step"
                    }
                  />
                )}
              />
            )}
          </Stack>
        );
      }}
      showAddStep={false}
      showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
      steps={steps.map(getDisplayStep)}
      teams={stores.teamStore.teams}
    />
  );
};

export default ApprovalStepTemplateVisibilityEditor;
