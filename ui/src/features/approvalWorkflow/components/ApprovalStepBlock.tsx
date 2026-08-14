import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import {
  getAssigneeIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import {
  AssigneeType,
  ApprovalStep,
  ApprovalStepAssignee,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  Dialogs,
  Flex,
  Icons,
  StackSpacing,
} from "@/shared/constants/constants";
import {
  AssignmentOutlined,
  ChecklistRtlOutlined,
  ExpandMore,
  Person,
  RuleOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepHeader from "./ApprovalStepHeader";
import ApprovalUpcomingTaskBlock from "./ApprovalUpcomingTaskBlock";

interface ApprovalStepBlockProps {
  contentSx?: SxProps<Theme>;
  footerContent?: ReactNode;
  headerAccessory?: ReactNode;
  highlightedTaskGlobalId?: string;
  onHighlightedTaskClick?: () => void;
  showEmptyTeamTasksMessage?: boolean;
  showStepBox?: boolean;
  showMetadata?: boolean;
  showStepTitle?: boolean;
  setupFutureTasks?: boolean;
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const stepMetadataSx: SxProps<Theme> = {
  alignItems: "center",
  color: "text.secondary",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.default,
  minWidth: 0,
};
const stepMetadataPieceSx: SxProps<Theme> = {
  alignItems: "center",
  display: "inline-flex",
  gap: StackSpacing.tight,
  minWidth: 0,
};
const stepMetadataTextSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const teamAccordionSx = {
  bgcolor: "transparent",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },
};

const teamAccordionSummarySx = {
  minHeight: 0,
  px: 0,
  py: 0,
  "& .MuiAccordionSummary-content": {
    my: 0,
  },
};

const teamAccordionDetailsSx = {
  px: 0,
  pb: 0,
  pt: Dialogs.stepHeaderSpacing,
};

const teamTaskListSx: SxProps<Theme> = {
  pl: 0,
};
const individualAssigneesGroupTitle = "Individual assignees";

export const getStepStatus = (
  step: ApprovalStep,
  tasks: ApprovalRequestTask[],
) => {
  if (tasks.length === 0) {
    return "Not started";
  }

  if (step.mode === ApprovalStepMode.All) {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === false)) {
      return "Completed unsuccessfully";
    }
    if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === true)) {
      return "Completed successfully";
    }
  } else {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === true)) {
      return "Completed successfully";
    }
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === false)) {
      return "Completed unsuccessfully";
    }
  }
  if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Skipped)) {
    return "Skipped";
  }
  if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Canceled)) {
    return "Canceled";
  }
  return "Pending";
};

const getStepStatusLabel = (status: string) => status;

const getStepBorderLeftColor = (status: string) => {
  switch (status) {
    case "Completed successfully":
      return "success.main";
    case "Completed unsuccessfully":
      return "error.main";
    case "Skipped":
    case "Canceled":
      return "warning.main";
    case "Pending":
      return "primary.main";
    default:
      return "divider";
  }
};

const getTaskAssigneeIcon = (step: ApprovalStep, task: ApprovalRequestTask) => {
  const assignee = step.assignees.find((item) => item.globalId === task.approvalRequestStepAssigneeGlobalId);
  return getAssigneeIcon(assignee?.type ?? AssigneeType.User);
};

const getTaskAssigneeType = (step: ApprovalStep, task: ApprovalRequestTask) =>
  step.assignees.find((item) => item.globalId === task.approvalRequestStepAssigneeGlobalId)?.type;

const getStepModeSummary = (mode: ApprovalStepMode) => {
  switch (mode) {
    case ApprovalStepMode.All:
      return "Everyone assigned to this step must approve it before the request can move forward.";
    default:
      return "The first approval from any assigned assignee completes this step.";
  }
};

const getStepModeLabel = (mode: ApprovalStepMode) => {
  switch (mode) {
    case ApprovalStepMode.All:
      return "All assignees";
    default:
      return "Any assignee";
  }
};

const getStepAction = (step: ApprovalStep) =>
  step.action ?? ApprovalRequestTaskAction.Approve;

const getStepVisibilityModeLabel = (step: ApprovalStep) => {
  switch (step.visibilityMode) {
    case ApprovalStepVisibilityMode.AllParticipantsExceptSelected:
      return "All participants except selected";
    case ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants:
      return "Assignees and selected participants";
    case ApprovalStepVisibilityMode.AssigneesOnly:
      return "Assignees only";
    default:
      return "All participants";
  }
};

const getStepVisibilityModeSummary = (step: ApprovalStep) => {
  switch (step.visibilityMode) {
    case ApprovalStepVisibilityMode.AllParticipantsExceptSelected:
      return "This step is visible to all participants except those selected.";
    case ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants:
      return "This step is visible to its assignees and selected participants.";
    case ApprovalStepVisibilityMode.AssigneesOnly:
      return "This step is visible only to its assignees.";
    default:
      return "This step is visible to all participants.";
  }
};

const getStepVisibilityModeIcon = (step: ApprovalStep) =>
  step.visibilityMode === undefined ||
  step.visibilityMode === ApprovalStepVisibilityMode.AllParticipants
    ? <VisibilityOutlined color={Icons.secondaryColor} fontSize="small" />
    : <VisibilityOffOutlined color={Icons.secondaryColor} fontSize="small" />;

const renderStepMetadataPiece = (
  key: string,
  icon: ReactNode,
  label: string,
  tooltip: string,
  ariaLabel: string,
) => (
  <Tooltip key={key} title={tooltip}>
    <Box aria-label={ariaLabel} sx={stepMetadataPieceSx}>
      {icon}
      <Typography variant="caption" color="text.secondary" sx={stepMetadataTextSx}>
        {label}
      </Typography>
    </Box>
  </Tooltip>
);

const renderStepMetadata = (
  step: ApprovalStep,
  stepMode: ApprovalStepMode,
  actionLabel: string,
  showVisibility: boolean,
) => {
  const pieces = [
    renderStepMetadataPiece(
      "action",
      <AssignmentOutlined color={Icons.secondaryColor} fontSize="small" />,
      actionLabel,
      `Action: ${actionLabel}`,
      `Step ${step.sequence} action ${actionLabel}`,
    ),
    renderStepMetadataPiece(
      "completion-rule",
      stepMode === ApprovalStepMode.All
        ? <ChecklistRtlOutlined color={Icons.secondaryColor} fontSize="small" />
        : <RuleOutlined color={Icons.secondaryColor} fontSize="small" />,
      getStepModeLabel(stepMode),
      getStepModeSummary(stepMode),
      `Step ${step.sequence} completion rule ${getStepModeLabel(stepMode)}`,
    ),
  ];

  if (showVisibility) {
    const visibilityLabel = getStepVisibilityModeLabel(step);
    pieces.push(renderStepMetadataPiece(
      "visibility",
      getStepVisibilityModeIcon(step),
      visibilityLabel,
      getStepVisibilityModeSummary(step),
      `Step ${step.sequence} visibility ${visibilityLabel}`,
    ));
  }

  return (
    <Stack direction="row" sx={stepMetadataSx}>
      {pieces}
    </Stack>
  );
};

export const ApprovalStepLabel: React.FC<{
  showVisibility?: boolean;
  step: ApprovalStep;
}> = ({ showVisibility = true, step }) => {
  const stepMode = step.mode ?? ApprovalStepMode.Any;
  const actionLabel = getApprovalRequestTaskActionLabels(getStepAction(step)).positive;

  return (
    <ApprovalStepHeader
      details={renderStepMetadata(step, stepMode, actionLabel, showVisibility)}
      sequence={step.sequence}
    />
  );
};

const getAssigneeTasks = (
  assignee: ApprovalStep["assignees"][number],
  tasks: ApprovalRequestTask[],
) => tasks.filter((task) => task.approvalRequestStepAssigneeGlobalId === assignee.globalId);

const getUnassignedTasks = (
  step: ApprovalStep,
  tasks: ApprovalRequestTask[],
) => {
  const assigneeGlobalIds = new Set((step.assignees ?? []).map((assignee) => assignee.globalId));
  return tasks.filter(
    (task) =>
      task.approvalRequestStepAssigneeGlobalId === undefined ||
      !assigneeGlobalIds.has(task.approvalRequestStepAssigneeGlobalId),
  );
};

const renderTaskDetails = (
  task: ApprovalRequestTask,
  icon: React.ReactNode,
  participantType: AssigneeType | undefined,
  isCurrentTask: boolean,
  stepperBorderLeftColor: string,
  onCurrentTaskClick?: () => void,
) => (
  <ApprovalRequestTaskSummaryBlock
    key={task.globalId}
    icon={icon}
    onClick={isCurrentTask ? onCurrentTaskClick : undefined}
    numberColor={
      task.status === ApprovalRequestTaskStatus.Pending ||
      task.status === ApprovalRequestTaskStatus.Completed
        ? "text.primary"
        : "text.secondary"
    }
    numberVariant="subtitle1"
    participant="assignee"
    participantType={participantType}
    showComment
    showDescription={false}
    showFiles={false}
    showElectronicSignature
    showRevision={false}
    stepperBorderLeftColor={stepperBorderLeftColor}
    showTitle={false}
    task={task}
    taskNumberPrefix="Task"
  />
);

const renderAssigneeWithoutTasks = (
  assignee: ApprovalStepAssignee,
  index: number,
  setupFutureTasks: boolean,
) => (
  <ApprovalUpcomingTaskBlock
    key={assignee.globalId ?? index}
    assignee={assignee}
    compact={setupFutureTasks}
    showAssigneeLabel={!setupFutureTasks}
    showStatusBorder={!setupFutureTasks}
    showTitle={!setupFutureTasks}
    showTimeline={!setupFutureTasks}
    title={setupFutureTasks ? "Task setup" : undefined}
  />
);

const renderTeamAssignee = (
  assignee: ApprovalStepAssignee,
  assigneeTasks: ApprovalRequestTask[],
  index: number,
  stepperBorderLeftColor: string,
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
  showEmptyTeamTasksMessage: boolean = true,
  setupFutureTasks: boolean = false,
) => {
  if (assigneeTasks.length === 0) {
    return showEmptyTeamTasksMessage
      ? renderAssigneeWithoutTasks(assignee, index, setupFutureTasks)
      : null;
  }

  return (
    <Accordion
      key={assignee.globalId ?? index}
      defaultExpanded
      disableGutters
      sx={teamAccordionSx}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={teamAccordionSummarySx}
      >
        <Stack
          direction="row"
          spacing={StackSpacing.tight}
          alignItems="center"
          sx={Flex.growSx}
        >
          <ApprovalRequestParticipant
            displayName={assignee.displayName}
            email={assignee.email}
            type={assignee.type}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={teamAccordionDetailsSx}>
        <Stack spacing={StackSpacing.default} sx={teamTaskListSx}>
          {assigneeTasks.map((task) =>
            renderTaskDetails(
              task,
              <Person color="action" fontSize="small" />,
              AssigneeType.Employee,
              task.globalId === highlightedTaskGlobalId,
              stepperBorderLeftColor,
              onHighlightedTaskClick,
            ),
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const renderAssignee = (
  step: ApprovalStep,
  assignee: ApprovalStepAssignee,
  tasks: ApprovalRequestTask[],
  index: number,
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
  showEmptyTeamTasksMessage?: boolean,
  stepperBorderLeftColor?: string,
  setupFutureTasks?: boolean,
) => {
  const assigneeTasks = getAssigneeTasks(assignee, tasks);
  if (assignee.type === AssigneeType.Team) {
    return renderTeamAssignee(
      assignee,
      assigneeTasks,
      index,
      stepperBorderLeftColor ?? "text.disabled",
      highlightedTaskGlobalId,
      onHighlightedTaskClick,
      showEmptyTeamTasksMessage,
      setupFutureTasks,
    );
  }

  if (assigneeTasks.length === 0) {
    return renderAssigneeWithoutTasks(assignee, index, setupFutureTasks ?? false);
  }

  return assigneeTasks.map((task) =>
    renderTaskDetails(
      task,
      getTaskAssigneeIcon(step, task),
      getTaskAssigneeType(step, task),
      task.globalId === highlightedTaskGlobalId,
      stepperBorderLeftColor ?? "text.disabled",
      onHighlightedTaskClick,
    ),
  );
};

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  contentSx,
  footerContent,
  headerAccessory,
  highlightedTaskGlobalId,
  onHighlightedTaskClick,
  showEmptyTeamTasksMessage = true,
  showStepBox = true,
  showMetadata = true,
  showStepTitle = true,
  setupFutureTasks = false,
  step,
  tasks,
}) => {
  const assignees = (step.assignees ?? []).filter(Boolean);
  const teamAssignees = assignees.filter(
    (assignee) => assignee.type === AssigneeType.Team,
  );
  const individualAssignees = assignees.filter(
    (assignee) => assignee.type !== AssigneeType.Team,
  );
  const hasMixedAssigneeTypes =
    teamAssignees.length > 0 && individualAssignees.length > 0;
  const unassignedTasks = getUnassignedTasks(step, tasks);
  const stepStatus = getStepStatus(step, tasks);
  const stepMode = step.mode ?? ApprovalStepMode.Any;
  const actionLabel = getApprovalRequestTaskActionLabels(getStepAction(step)).positive;
  const stepperBorderLeftColor = getStepBorderLeftColor(stepStatus);
  const renderAssigneeItem = (
    assignee: ApprovalStepAssignee,
    index: number,
  ) =>
    renderAssignee(
      step,
      assignee,
      tasks,
      index,
      highlightedTaskGlobalId,
      onHighlightedTaskClick,
      showEmptyTeamTasksMessage,
      stepperBorderLeftColor,
      setupFutureTasks,
    );

  const stepContent = (
    <Stack spacing={Dialogs.stepStackSpacing}>
      {(showStepTitle || showMetadata || headerAccessory) && (
        <ApprovalStepHeader
          accessory={headerAccessory}
          details={showMetadata && renderStepMetadata(step, stepMode, actionLabel)}
          hasBottomMargin
          sequence={step.sequence}
          showTitle={showStepTitle}
        />
      )}
        <Stack spacing={Dialogs.assigneeStackSpacing} sx={contentSx}>
          {teamAssignees.map((assignee) =>
            renderAssigneeItem(assignee, assignees.indexOf(assignee)),
          )}
          {hasMixedAssigneeTypes ? (
            <Accordion
              defaultExpanded
              disableGutters
              sx={teamAccordionSx}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={teamAccordionSummarySx}
              >
                <ApprovalRequestParticipant
                  displayName={individualAssigneesGroupTitle}
                  type={AssigneeType.Team}
                />
              </AccordionSummary>
              <AccordionDetails sx={teamAccordionDetailsSx}>
                <Stack spacing={Dialogs.assigneeStackSpacing}>
                  {individualAssignees.map((assignee) =>
                    renderAssigneeItem(assignee, assignees.indexOf(assignee)),
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ) : (
            individualAssignees.map((assignee) =>
              renderAssigneeItem(assignee, assignees.indexOf(assignee)),
            )
          )}
          {unassignedTasks.map((task) =>
            renderTaskDetails(
              task,
              getTaskAssigneeIcon(step, task),
              getTaskAssigneeType(step, task),
              task.globalId === highlightedTaskGlobalId,
              stepperBorderLeftColor,
              onHighlightedTaskClick,
            ),
          )}
        </Stack>
        {footerContent}
    </Stack>
  );

  return showStepBox ? (
    <Box aria-label={getStepStatusLabel(stepStatus)} sx={Dialogs.approvalBoxSx}>
      {stepContent}
    </Box>
  ) : stepContent;
};

export default ApprovalStepBlock;
