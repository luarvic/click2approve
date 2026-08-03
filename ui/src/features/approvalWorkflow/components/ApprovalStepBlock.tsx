import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import {
  getApprovalRecipientIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
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

interface ApprovalStepBlockProps {
  contentSx?: SxProps<Theme>;
  footerContent?: ReactNode;
  headerAccessory?: ReactNode;
  highlightedTaskGlobalId?: string;
  onHighlightedTaskClick?: () => void;
  showEmptyTeamTasksMessage?: boolean;
  showVisibility?: boolean;
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const approvalStepHeaderSx = { mb: Dialogs.stepHeaderSpacing };
const stepTitleRowSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.default,
};
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

const getStepStatus = (
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

const getTaskApproverIcon = (step: ApprovalStep, task: ApprovalRequestTask) => {
  const approver = step.approvers.find((item) => item.globalId === task.approvalRequestStepApproverGlobalId);
  return getApprovalRecipientIcon(approver?.type ?? ApprovalRecipientType.Email);
};

const getTaskApproverType = (step: ApprovalStep, task: ApprovalRequestTask) =>
  step.approvers.find((item) => item.globalId === task.approvalRequestStepApproverGlobalId)?.type;

const getStepModeSummary = (mode: ApprovalStepMode) => {
  switch (mode) {
    case ApprovalStepMode.All:
      return "Everyone assigned to this step must approve it before the request can move forward.";
    default:
      return "The first approval from any assigned approver completes this step.";
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

const getHiddenApproverLabels = (step: ApprovalStep) =>
  (step.visibility ?? [])
    .filter((visibility) => visibility.isVisible === false)
    .map((visibility) =>
      visibility.approverDisplayName ??
      visibility.approverEmail ??
      "Approver",
    )
    .filter((label): label is string => Boolean(label));

const getStepVisibilityLabel = (step: ApprovalStep) => {
  const hiddenApproverLabels = getHiddenApproverLabels(step);
  return hiddenApproverLabels.length === 0
    ? "Visible to all"
    : `Hidden from ${hiddenApproverLabels.join(", ")}`;
};

const getStepVisibilityIcon = (step: ApprovalStep) =>
  getHiddenApproverLabels(step).length === 0
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
    const visibilityLabel = getStepVisibilityLabel(step);
    pieces.push(renderStepMetadataPiece(
      "visibility",
      getStepVisibilityIcon(step),
      visibilityLabel,
      visibilityLabel,
      `Step ${step.sequence} visibility ${visibilityLabel}`,
    ));
  }

  return (
    <Stack
      direction="row"
      sx={stepMetadataSx}
    >
      {pieces}
    </Stack>
  );
};

const getApproverTasks = (
  approver: ApprovalStep["approvers"][number],
  tasks: ApprovalRequestTask[],
) => tasks.filter((task) => task.approvalRequestStepApproverGlobalId === approver.globalId);

const getUnassignedTasks = (
  step: ApprovalStep,
  tasks: ApprovalRequestTask[],
) => {
  const approverGlobalIds = new Set((step.approvers ?? []).map((approver) => approver.globalId));
  return tasks.filter(
    (task) =>
      task.approvalRequestStepApproverGlobalId === undefined ||
      !approverGlobalIds.has(task.approvalRequestStepApproverGlobalId),
  );
};

const renderTaskDetails = (
  task: ApprovalRequestTask,
  icon: React.ReactNode,
  participantType: ApprovalRecipientType | undefined,
  isCurrentTask: boolean,
  onCurrentTaskClick?: () => void,
) => (
  <ApprovalRequestTaskSummaryBlock
    key={task.globalId}
    icon={icon}
    onClick={isCurrentTask ? onCurrentTaskClick : undefined}
    participant="approver"
    participantType={participantType}
    showComment
    showDescription={false}
    showFiles={false}
    showElectronicSignature
    showRevision={false}
    showTitle={false}
    task={task}
    taskNumberPrefix="Task"
  />
);

const renderApproverWithoutTasks = (
  approver: ApprovalStepApprover,
  index: number,
) => (
  <Stack
    key={approver.globalId ?? index}
    direction="row"
    spacing={StackSpacing.tight}
    alignItems="center"
  >
    <ApprovalRequestParticipant
      displayName={approver.displayName}
      email={approver.email}
      type={approver.type}
    />
  </Stack>
);

const renderTeamApprover = (
  approver: ApprovalStepApprover,
  approverTasks: ApprovalRequestTask[],
  index: number,
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
  showEmptyTeamTasksMessage: boolean = true,
) => (
  <Accordion
    key={approver.globalId ?? index}
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
          displayName={approver.displayName}
          email={approver.email}
          type={approver.type}
        />
      </Stack>
    </AccordionSummary>
    {(approverTasks.length > 0 || showEmptyTeamTasksMessage) && (
      <AccordionDetails sx={teamAccordionDetailsSx}>
        {approverTasks.length > 0 ? (
          <Stack spacing={StackSpacing.default} sx={teamTaskListSx}>
            {approverTasks.map((task) =>
              renderTaskDetails(
              task,
              <Person color="action" fontSize="small" />,
              ApprovalRecipientType.Employee,
              task.globalId === highlightedTaskGlobalId,
              onHighlightedTaskClick,
            ),
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No employee tasks yet
          </Typography>
        )}
      </AccordionDetails>
    )}
  </Accordion>
);

const renderApprover = (
  step: ApprovalStep,
  approver: ApprovalStepApprover,
  tasks: ApprovalRequestTask[],
  index: number,
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
  showEmptyTeamTasksMessage?: boolean,
) => {
  const approverTasks = getApproverTasks(approver, tasks);
  if (approver.type === ApprovalRecipientType.Team) {
    return renderTeamApprover(
      approver,
      approverTasks,
      index,
      highlightedTaskGlobalId,
      onHighlightedTaskClick,
      showEmptyTeamTasksMessage,
    );
  }

  if (approverTasks.length === 0) {
    return renderApproverWithoutTasks(approver, index);
  }

  return approverTasks.map((task) =>
    renderTaskDetails(
      task,
      getTaskApproverIcon(step, task),
      getTaskApproverType(step, task),
      task.globalId === highlightedTaskGlobalId,
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
  showVisibility = true,
  step,
  tasks,
}) => {
  const approvers = (step.approvers ?? []).filter(Boolean);
  const unassignedTasks = getUnassignedTasks(step, tasks);
  const stepStatus = getStepStatus(step, tasks);
  const stepMode = step.mode ?? ApprovalStepMode.Any;
  const actionLabel = getApprovalRequestTaskActionLabels(getStepAction(step)).positive;

  return (
    <Box
      aria-label={getStepStatusLabel(stepStatus)}
      sx={Dialogs.approvalBoxSx}
    >
      <Stack spacing={Dialogs.stepStackSpacing}>
        <Stack
          direction="row"
          spacing={Dialogs.stepHeaderSpacing}
          alignItems="center"
          sx={approvalStepHeaderSx}
        >
          <Stack
            sx={Flex.growSx}
          >
            <Stack
              direction="row"
              sx={stepTitleRowSx}
            >
              <Typography variant="subtitle1">
                Step {step.sequence}
              </Typography>
              {renderStepMetadata(step, stepMode, actionLabel, showVisibility)}
              {headerAccessory}
            </Stack>
          </Stack>
        </Stack>
        <Stack spacing={Dialogs.approverStackSpacing} sx={contentSx}>
          {approvers.map((approver, index) =>
            renderApprover(
              step,
              approver,
              tasks,
              index,
              highlightedTaskGlobalId,
              onHighlightedTaskClick,
              showEmptyTeamTasksMessage,
            ),
          )}
          {unassignedTasks.map((task) =>
            renderTaskDetails(
              task,
              getTaskApproverIcon(step, task),
              getTaskApproverType(step, task),
              task.globalId === highlightedTaskGlobalId,
              onHighlightedTaskClick,
            ),
          )}
        </Stack>
        {footerContent}
      </Stack>
    </Box>
  );
};

export default ApprovalStepBlock;
