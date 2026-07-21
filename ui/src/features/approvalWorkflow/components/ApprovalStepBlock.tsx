import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestParticipantLine, {
  getApprovalRecipientIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  ApprovalStatusLineColor,
  ApprovalStatusLineSection,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTaskLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Flex, Icons, StackSpacing } from "@/shared/constants/constants";
import {
  ChecklistRtlOutlined,
  ExpandMore,
  Person,
  RuleOutlined,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepBlockProps {
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const approvalStepBlockSx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
};

const approvalStepHeaderSx = { mb: 1 };

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
  pt: 1,
};

const teamTaskListSx: SxProps<Theme> = {
  pl: 3,
};

const getStepStatus = (step: ApprovalStep, tasks: ApprovalRequestTask[]) => {
  if (tasks.length === 0) {
    return "Not started";
  }
  if (step.mode === ApprovalStepMode.All) {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Rejected)) {
      return "Rejected";
    }
    if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Approved)) {
      return "Approved";
    }
  } else {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Approved)) {
      return "Approved";
    }
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Rejected)) {
      return "Rejected";
    }
  }
  if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Skipped)) {
    return "Skipped";
  }
  return "Pending";
};

const getTaskCompletionLabel = (status: ApprovalRequestTaskStatus) => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved at";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped at";
    default:
      return "Completed at";
  }
};

const getTaskCompletionTimestampType = (
  status: ApprovalRequestTaskStatus,
): ApprovalRequestTimestampType => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "approved";
    case ApprovalRequestTaskStatus.Rejected:
      return "rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "skipped";
    default:
      return "completed";
  }
};

const getStepStatusLineColor = (status: string): ApprovalStatusLineColor => {
  switch (status) {
    case "Approved":
      return "approved";
    case "Rejected":
      return "changeRequested";
    default:
      return "other";
  }
};

const getStepStatusLabel = (status: string) =>
  status === "Rejected" ? "Change requested" : status;

const getApproverLabel = (approver: ApprovalStep["approvers"][number]) =>
  approver.displayName;

const getTaskApproverLabel = (task: ApprovalRequestTask) =>
  task.approverDisplayName;

const getTeamTaskApproverLabel = (task: ApprovalRequestTask) =>
  task.approverDisplayName;

const getTaskApproverIcon = (step: ApprovalStep, task: ApprovalRequestTask) => {
  const approver = step.approvers.find((item) => item.id === task.approvalRequestStepApproverId);
  return getApprovalRecipientIcon(approver?.type ?? ApprovalRecipientType.Email);
};

const renderStepModeIndicator = (mode: ApprovalStepMode) => {
  const label = mode === ApprovalStepMode.All
    ? "All approvers"
    : "Any approver";
  const icon = mode === ApprovalStepMode.All
    ? <ChecklistRtlOutlined color={Icons.secondaryColor} fontSize="small" />
    : <RuleOutlined color={Icons.secondaryColor} fontSize="small" />;

  return (
    <Tooltip title={label}>
      {icon}
    </Tooltip>
  );
};

const getTaskCompletionDate = (task: ApprovalRequestTask) => {
  if (task.status === ApprovalRequestTaskStatus.Pending) {
    return null;
  }

  return (task.logEntries ?? [])
    .filter((entry) => entry.eventType === ApprovalRequestTaskLogEventType.StatusChanged)
    .map((entry) => entry.timestampDate)
    .filter(Boolean)
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
};

const getApproverTasks = (
  approver: ApprovalStep["approvers"][number],
  tasks: ApprovalRequestTask[],
) => tasks.filter((task) => task.approvalRequestStepApproverId === approver.id);

const getUnassignedTasks = (
  step: ApprovalStep,
  tasks: ApprovalRequestTask[],
) => {
  const approverIds = new Set((step.approvers ?? []).map((approver) => approver.id));
  return tasks.filter(
    (task) =>
      task.approvalRequestStepApproverId === undefined ||
      !approverIds.has(task.approvalRequestStepApproverId),
  );
};

const renderTaskDetails = (
  task: ApprovalRequestTask,
  label: string,
  icon: React.ReactNode,
) => {
  const completedAt = getTaskCompletionDate(task);

  return (
    <Stack key={task.id} spacing={StackSpacing.default}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={StackSpacing.tight}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <ApprovalRequestParticipantLine
          canViewRequest={task.canViewRequest}
          icon={icon}
          label={label}
          showTrackingIndicator
          sx={Flex.growSx}
        />
      </Stack>
      <ApprovalRequestComment text={task.comment} />
      <ApprovalRequestTimestampRow
        items={[
          {
            date: task.createdAtDate,
            label: "Created at",
            type: "created",
          },
          completedAt
            ? {
              date: completedAt,
              label: getTaskCompletionLabel(task.status),
              type: getTaskCompletionTimestampType(task.status),
            }
            : null,
        ]}
      />
    </Stack>
  );
};

const renderApproverWithoutTasks = (
  approver: ApprovalStepApprover,
  index: number,
) => (
  <ApprovalRequestParticipantLine
    key={approver.id ?? index}
    canViewRequest={approver.canViewRequest}
    label={getApproverLabel(approver)}
    showTrackingIndicator
    type={approver.type}
  />
);

const renderTeamApprover = (
  approver: ApprovalStepApprover,
  approverTasks: ApprovalRequestTask[],
  index: number,
) => (
  <Accordion
    key={approver.id ?? index}
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
        <ApprovalRequestParticipantLine
          canViewRequest={approver.canViewRequest}
          label={getApproverLabel(approver)}
          showTrackingIndicator
          type={approver.type}
        />
        <Typography variant="caption" color="text.secondary">
          {approverTasks.length} {approverTasks.length === 1 ? "task" : "tasks"}
        </Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={teamAccordionDetailsSx}>
      {approverTasks.length > 0 ? (
        <Stack spacing={StackSpacing.default} sx={teamTaskListSx}>
          {approverTasks.map((task) =>
            renderTaskDetails(
              task,
              getTeamTaskApproverLabel(task),
              <Person color="action" fontSize="small" />,
            ),
          )}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No employee tasks yet
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
);

const renderApprover = (
  step: ApprovalStep,
  approver: ApprovalStepApprover,
  tasks: ApprovalRequestTask[],
  index: number,
) => {
  const approverTasks = getApproverTasks(approver, tasks);
  if (approver.type === ApprovalRecipientType.Team) {
    return renderTeamApprover(approver, approverTasks, index);
  }

  if (approverTasks.length === 0) {
    return renderApproverWithoutTasks(approver, index);
  }

  return approverTasks.map((task) =>
    renderTaskDetails(
      task,
      getTaskApproverLabel(task),
      getTaskApproverIcon(step, task),
    ),
  );
};

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  step,
  tasks,
}) => {
  const approvers = (step.approvers ?? []).filter(Boolean);
  const stepStatus = getStepStatus(step, tasks);
  const unassignedTasks = getUnassignedTasks(step, tasks);

  return (
    <ApprovalStatusLineSection
      color={getStepStatusLineColor(stepStatus)}
      label={getStepStatusLabel(stepStatus)}
      sx={approvalStepBlockSx}
    >
      <Stack spacing={StackSpacing.default}>
        <Stack
          direction="row"
          spacing={StackSpacing.default}
          alignItems="center"
          sx={approvalStepHeaderSx}
        >
          <Stack
            direction="row"
            spacing={StackSpacing.tight}
            alignItems="center"
            sx={Flex.growSx}
          >
            <Typography variant="subtitle2">
              Step {step.sequence}
            </Typography>
            {renderStepModeIndicator(step.mode)}
          </Stack>
        </Stack>
        {approvers.map((approver, index) =>
          renderApprover(step, approver, tasks, index),
        )}
        {unassignedTasks.map((task) =>
          renderTaskDetails(
            task,
            getTaskApproverLabel(task),
            getTaskApproverIcon(step, task),
          ),
        )}
      </Stack>
    </ApprovalStatusLineSection>
  );
};

export default ApprovalStepBlock;
