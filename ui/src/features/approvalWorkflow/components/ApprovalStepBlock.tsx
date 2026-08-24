import { getAssigneeIcon } from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestTaskAttachmentList from "@/features/approvalRequests/components/ApprovalRequestTaskAttachmentList";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import {
  ApprovalStep,
  ApprovalStepAssignee,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  getApprovalStepBorderLeftColor,
  getApprovalStepStatus,
} from "@/features/approvalWorkflow/utils/approvalStepStatus";
import { Dialogs, Icons, StackSpacing } from "@/shared/constants/constants";
import {
  AssignmentOutlined,
  AttachFile,
  ChecklistRtlOutlined,
  CommentOutlined,
  DrawOutlined,
  Person,
  RuleOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepHeader from "./ApprovalStepHeader";
import ApprovalStepIndividualAssignees from "./ApprovalStepIndividualAssignees";
import ApprovalStepTeamAccordion from "./ApprovalStepTeamAccordion";
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
  taskAttachmentsTenantGlobalId?: string;
}

const stepMetadataPieceSx: SxProps<Theme> = {
  alignItems: "center",
  display: "inline-flex",
  gap: StackSpacing.tight,
  minWidth: 0,
};
const stepMetadataSx: SxProps<Theme> = {
  alignItems: "center",
  color: "text.secondary",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.default,
  minWidth: 0,
};
const stepMetadataTextSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
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

const getStepAction = (step: ApprovalStep) => step.action ?? ApprovalRequestTaskAction.Approve;

const getStepVisibilityModeLabel = (step: ApprovalStep) => {
  switch (step.visibilityMode) {
    case ApprovalStepVisibilityMode.OrganizationEmployees:
      return "Organization employees";
    case ApprovalStepVisibilityMode.AssigneesOnly:
      return "Assignees only";
    default:
      return "All participants";
  }
};

const getStepVisibilityModeSummary = (step: ApprovalStep) => {
  switch (step.visibilityMode) {
    case ApprovalStepVisibilityMode.OrganizationEmployees:
      return "This step is visible to organization employees.";
    case ApprovalStepVisibilityMode.AssigneesOnly:
      return "This step is visible only to its assignees.";
    default:
      return "This step is visible to all participants.";
  }
};

const getStepVisibilityModeIcon = (step: ApprovalStep) =>
  step.visibilityMode === undefined || step.visibilityMode === ApprovalStepVisibilityMode.AllParticipants ? (
    <VisibilityOutlined color={Icons.secondaryColor} fontSize="small" />
  ) : (
    <VisibilityOffOutlined color={Icons.secondaryColor} fontSize="small" />
  );

const renderStepMetadataPiece = (key: string, icon: ReactNode, label: string, tooltip: string, ariaLabel: string) => (
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
      stepMode === ApprovalStepMode.All ? (
        <ChecklistRtlOutlined color={Icons.secondaryColor} fontSize="small" />
      ) : (
        <RuleOutlined color={Icons.secondaryColor} fontSize="small" />
      ),
      getStepModeLabel(stepMode),
      getStepModeSummary(stepMode),
      `Step ${step.sequence} completion rule ${getStepModeLabel(stepMode)}`,
    ),
  ];

  if (step.isCommentRequired) {
    pieces.push(
      renderStepMetadataPiece(
        "comment-required",
        <CommentOutlined color={Icons.secondaryColor} fontSize="small" />,
        "Comment required",
        "A comment is required for a positive result.",
        `Step ${step.sequence} requires a comment`,
      ),
    );
  }

  if (step.isElectronicSignatureRequired) {
    pieces.push(
      renderStepMetadataPiece(
        "electronic-signature-required",
        <DrawOutlined color={Icons.secondaryColor} fontSize="small" />,
        "Electronic signature required",
        "An electronic signature is required for a positive result.",
        `Step ${step.sequence} requires an electronic signature`,
      ),
    );
  }

  if (step.isAttachmentRequired) {
    pieces.push(
      renderStepMetadataPiece(
        "attachment-required",
        <AttachFile color={Icons.secondaryColor} fontSize="small" />,
        "Attachment required",
        "An attachment is required for a positive result.",
        `Step ${step.sequence} requires an attachment`,
      ),
    );
  }

  if (showVisibility) {
    const visibilityLabel = getStepVisibilityModeLabel(step);
    pieces.push(
      renderStepMetadataPiece(
        "visibility",
        getStepVisibilityModeIcon(step),
        visibilityLabel,
        getStepVisibilityModeSummary(step),
        `Step ${step.sequence} visibility ${visibilityLabel}`,
      ),
    );
  }

  return <>{pieces}</>;
};

export const ApprovalStepMetadata: React.FC<{
  showVisibility?: boolean;
  step: ApprovalStep;
}> = ({ showVisibility = true, step }) => {
  const stepMode = step.mode ?? ApprovalStepMode.Any;
  const actionLabel = getApprovalRequestTaskActionLabels(getStepAction(step)).positive;

  return (
    <Stack direction="row" sx={stepMetadataSx}>
      {renderStepMetadata(step, stepMode, actionLabel, showVisibility)}
    </Stack>
  );
};

const getAssigneeTasks = (assignee: ApprovalStep["assignees"][number], tasks: ApprovalRequestTask[]) =>
  tasks.filter((task) => task.approvalRequestStepAssigneeGlobalId === assignee.globalId);

const getUnassignedTasks = (step: ApprovalStep, tasks: ApprovalRequestTask[]) => {
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
  taskAttachmentsTenantGlobalId?: string,
) => (
  <ApprovalRequestTaskSummaryBlock
    additionalMetadata={
      taskAttachmentsTenantGlobalId && task.taskFiles?.length ? (
        <ApprovalRequestTaskAttachmentList
          label="Files attached to this decision"
          taskFiles={task.taskFiles ?? []}
          taskGlobalId={task.globalId}
          tenantGlobalId={taskAttachmentsTenantGlobalId}
        />
      ) : undefined
    }
    key={task.globalId}
    icon={icon}
    onClick={isCurrentTask ? onCurrentTaskClick : undefined}
    numberColor={
      task.status === ApprovalRequestTaskStatus.Pending || task.status === ApprovalRequestTaskStatus.Completed
        ? "text.primary"
        : "text.secondary"
    }
    numberComponent="h3"
    numberVariant="h6"
    participant="assignee"
    participantType={participantType}
    showComment
    showDescription={false}
    showFiles={false}
    showInstructionsLabel={false}
    showElectronicSignature
    showRevision={false}
    stepperBorderLeftColor={task.status === ApprovalRequestTaskStatus.Pending ? stepperBorderLeftColor : undefined}
    showTitle={false}
    task={task}
    taskNumberPrefix="Task"
  />
);

const renderAssigneeWithoutTasks = (
  assignee: ApprovalStepAssignee,
  index: number,
  setupFutureTasks: boolean,
  instructions?: string,
) => (
  <ApprovalUpcomingTaskBlock
    key={assignee.globalId ?? index}
    assignee={assignee}
    compact={setupFutureTasks}
    instructions={instructions}
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
  taskAttachmentsTenantGlobalId?: string,
  instructions?: string,
) => {
  if (assigneeTasks.length === 0) {
    return showEmptyTeamTasksMessage
      ? renderAssigneeWithoutTasks(assignee, index, setupFutureTasks, instructions)
      : null;
  }

  return (
    <ApprovalStepTeamAccordion assignee={assignee} index={index}>
      <Stack spacing={StackSpacing.default}>
        {assigneeTasks.map((task) =>
          renderTaskDetails(
            task,
            <Person color="action" fontSize="small" />,
            AssigneeType.Employee,
            task.globalId === highlightedTaskGlobalId,
            stepperBorderLeftColor,
            onHighlightedTaskClick,
            taskAttachmentsTenantGlobalId,
          ),
        )}
      </Stack>
    </ApprovalStepTeamAccordion>
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
  taskAttachmentsTenantGlobalId?: string,
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
      taskAttachmentsTenantGlobalId,
      step.instructions,
    );
  }

  if (assigneeTasks.length === 0) {
    return renderAssigneeWithoutTasks(assignee, index, setupFutureTasks ?? false, step.instructions);
  }

  return assigneeTasks.map((task) =>
    renderTaskDetails(
      task,
      getTaskAssigneeIcon(step, task),
      getTaskAssigneeType(step, task),
      task.globalId === highlightedTaskGlobalId,
      stepperBorderLeftColor ?? "text.disabled",
      onHighlightedTaskClick,
      taskAttachmentsTenantGlobalId,
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
  taskAttachmentsTenantGlobalId,
  tasks,
}) => {
  const assignees = (step.assignees ?? []).filter(Boolean);
  const teamAssignees = assignees.filter((assignee) => assignee.type === AssigneeType.Team);
  const individualAssignees = assignees.filter((assignee) => assignee.type !== AssigneeType.Team);
  const hasMixedAssigneeTypes = teamAssignees.length > 0 && individualAssignees.length > 0;
  const unassignedTasks = getUnassignedTasks(step, tasks);
  const stepStatus = getApprovalStepStatus(step, tasks);
  const stepMode = step.mode ?? ApprovalStepMode.Any;
  const actionLabel = getApprovalRequestTaskActionLabels(getStepAction(step)).positive;
  const stepperBorderLeftColor = getApprovalStepBorderLeftColor(stepStatus);
  const renderAssigneeItem = (assignee: ApprovalStepAssignee, index: number) =>
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
      taskAttachmentsTenantGlobalId,
    );

  const stepContent = (
    <Stack spacing={Dialogs.stepStackSpacing}>
      {(showStepTitle || showMetadata || headerAccessory) && (
        <ApprovalStepHeader
          accessory={headerAccessory}
          details={showMetadata && renderStepMetadata(step, stepMode, actionLabel, true)}
          hasBottomMargin
          sequence={step.sequence}
          showTitle={showStepTitle}
        />
      )}
      <Stack spacing={Dialogs.assigneeStackSpacing} sx={contentSx}>
        {teamAssignees.map((assignee) => renderAssigneeItem(assignee, assignees.indexOf(assignee)))}
        {hasMixedAssigneeTypes ? (
          <ApprovalStepIndividualAssignees>
            <Stack spacing={Dialogs.assigneeStackSpacing}>
              {individualAssignees.map((assignee) => renderAssigneeItem(assignee, assignees.indexOf(assignee)))}
            </Stack>
          </ApprovalStepIndividualAssignees>
        ) : (
          individualAssignees.map((assignee) => renderAssigneeItem(assignee, assignees.indexOf(assignee)))
        )}
        {unassignedTasks.map((task) =>
          renderTaskDetails(
            task,
            getTaskAssigneeIcon(step, task),
            getTaskAssigneeType(step, task),
            task.globalId === highlightedTaskGlobalId,
            stepperBorderLeftColor,
            onHighlightedTaskClick,
            taskAttachmentsTenantGlobalId,
          ),
        )}
      </Stack>
      {footerContent}
    </Stack>
  );

  return showStepBox ? (
    <Box aria-label={stepStatus} sx={Dialogs.approvalBoxSx}>
      {stepContent}
    </Box>
  ) : (
    stepContent
  );
};

export default ApprovalStepBlock;
