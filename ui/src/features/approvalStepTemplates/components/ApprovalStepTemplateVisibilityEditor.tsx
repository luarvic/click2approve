import {
  AssigneeType,
  ApprovalStep,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import ApprovalStepBlock, { ApprovalStepLabel } from "@/features/approvalWorkflow/components/ApprovalStepBlock";
import { Dialogs } from "@/shared/constants/constants";
import { AccountTreeOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

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
const stepContentSx: SxProps<Theme> = { pr: 0 };
const stepLabelSx: SxProps<Theme> = {
  "& .MuiStepLabel-label, & .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: "text.primary",
  },
};
const toggleButtonGroupSx: SxProps<Theme> = {
  display: { xs: "none", sm: "flex" },
  "& .MuiToggleButton-root": {
    flex: 1,
    textTransform: "none",
    typography: "body2",
  },
};
const mobileModeOptionsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  display: { sm: "none", xs: "flex" },
  flexDirection: "column",
};
const VisibilityStepIcon = () => <AccountTreeOutlined color="action" fontSize="small" />;

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
    <Stepper activeStep={-1} nonLinear orientation="vertical">
      {steps.map((step, stepIndex) => {
        const displayStep = getDisplayStep(step);
        const mode = visibilityModeValues[step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants];
        const ownAssigneeIds = new Set(step.assignees.map((assignee) => assignee.globalId));
        const additionalAssignees = allAssignees.filter((assignee) => !ownAssigneeIds.has(assignee.globalId));
        const selectedAssignees = additionalAssignees.filter((assignee) => {
          const isVisible =
            step.visibility?.find((visibility) => visibility.assigneeGlobalId === assignee.globalId)?.isVisible ??
            (mode === "all" || mode === "allExcept");
          return mode === "allExcept" ? !isVisible : isVisible;
        });

        return (
          <Step expanded key={step.sequence}>
            <StepLabel StepIconComponent={VisibilityStepIcon} sx={stepLabelSx}>
              <ApprovalStepLabel showVisibility={false} step={displayStep} />
            </StepLabel>
            <StepContent sx={stepContentSx} TransitionProps={{ in: true, unmountOnExit: false }}>
              <ApprovalStepBlock
                setupFutureTasks
                showMetadata={false}
                showStepBox={false}
                showStepTitle={false}
                step={displayStep}
                tasks={[]}
                footerContent={
                  <Stack spacing={Dialogs.stepHeaderSpacing}>
                    <Typography variant="subtitle2">Visibility</Typography>
                    <RadioGroup
                      aria-label="Visibility"
                      row={false}
                      sx={mobileModeOptionsSx}
                      value={mode}
                      onChange={(event) => updateVisibility(stepIndex, event.target.value as VisibilityMode, [])}
                    >
                      {options.map((option) => (
                        <FormControlLabel
                          control={<Radio />}
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </RadioGroup>
                    <ToggleButtonGroup
                      exclusive
                      sx={toggleButtonGroupSx}
                      value={mode}
                      onChange={(_, value: VisibilityMode | null) => value && updateVisibility(stepIndex, value, [])}
                    >
                      {options.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    {(mode === "selected" || mode === "allExcept") && (
                      <Autocomplete
                        multiple
                        filterSelectedOptions
                        options={additionalAssignees}
                        value={selectedAssignees}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
                        onChange={(_, value) => updateVisibility(stepIndex, mode, value)}
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
                }
              />
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default ApprovalStepTemplateVisibilityEditor;
import { stores } from "@/app/rootStore";
