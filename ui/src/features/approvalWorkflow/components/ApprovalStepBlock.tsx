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
import {
  Dialogs,
  Flex,
  Icons,
  StackSpacing,
} from "@/shared/constants/constants";
import {
  ChecklistRtlOutlined,
  ExpandMore,
  Person,
  RuleOutlined,
  VisibilityOff,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useState } from "react";

interface ApprovalStepBlockProps {
  contentSx?: SxProps<Theme>;
  headerAccessory?: ReactNode;
  lineVariant?: "solid" | "dotted";
  statusColor?: ApprovalStatusLineColor;
  statusLabel?: string;
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const approvalStepBlockSx: SxProps<Theme> = {
  px: Dialogs.stepStackSpacing,
  py: 0,
};

const approvalStepHeaderSx = { mb: Dialogs.stepHeaderSpacing };
const stepHeaderActionsSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  ml: Dialogs.stepHeaderSpacing,
};
const visibilityPopoverSx: SxProps<Theme> = {
  maxWidth: 320,
  p: 2,
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
  pl: 3,
};

const getStepStatus = (
  step: ApprovalStep,
  tasks: ApprovalRequestTask[],
) => {
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
  if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Canceled)) {
    return "Canceled";
  }
  return "Pending";
};

const getTaskCompletionLabel = (
  task: ApprovalRequestTask,
) => {
  switch (task.status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved at";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped at";
    case ApprovalRequestTaskStatus.Canceled:
      return "Canceled at";
    default:
      return "Completed at";
  }
};

const getTaskCompletionTimestampType = (
  task: ApprovalRequestTask,
): ApprovalRequestTimestampType => {
  switch (task.status) {
    case ApprovalRequestTaskStatus.Approved:
      return "approved";
    case ApprovalRequestTaskStatus.Rejected:
      return "rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "skipped";
    case ApprovalRequestTaskStatus.Canceled:
      return "canceled";
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
    case "Canceled":
    case "Skipped":
      return "canceled";
    default:
      return "other";
  }
};

const getStepStatusLabel = (status: string) => {
  switch (status) {
    case "Rejected":
      return "Change requested";
    default:
      return status;
  }
};

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

const getStepModeSummary = (mode: ApprovalStepMode) => {
  switch (mode) {
    case ApprovalStepMode.All:
      return "Everyone assigned to this step must approve it before the request can move forward.";
    default:
      return "The first approval from any assigned approver completes this step.";
  }
};

const getHiddenApproverLabels = (step: ApprovalStep) => {
  return (step.visibility ?? [])
    .filter((visibility) => visibility.isVisible === false)
    .map((visibility) =>
      visibility.approverDisplayName ??
      visibility.approverEmail ??
      "Approver",
    )
    .filter((label): label is string => Boolean(label));
};

const renderVisibilitySummary = (hiddenApproverLabels: string[]) => {
  if (hiddenApproverLabels.length === 0) {
    return "Visible to all request approvers.";
  }

  return (
    <Stack spacing={StackSpacing.tight}>
      <Typography variant="body2">
        Hidden from:
      </Typography>
      {hiddenApproverLabels.map((label) => (
        <Typography key={label} variant="body2" color="text.secondary">
          {label}
        </Typography>
      ))}
    </Stack>
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
          icon={icon}
          label={label}
          sx={Flex.growSx}
        />
      </Stack>
      <ApprovalRequestComment label="Comment" text={task.comment} />
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
              label: getTaskCompletionLabel(task),
              type: getTaskCompletionTimestampType(task),
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
    label={getApproverLabel(approver)}
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
          label={getApproverLabel(approver)}
          type={approver.type}
        />
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
  contentSx,
  headerAccessory,
  lineVariant,
  statusColor,
  statusLabel,
  step,
  tasks,
}) => {
  const [modeAnchor, setModeAnchor] = useState<HTMLElement | null>(null);
  const [visibilityAnchor, setVisibilityAnchor] = useState<HTMLElement | null>(null);
  const approvers = (step.approvers ?? []).filter(Boolean);
  const stepStatus = getStepStatus(step, tasks);
  const unassignedTasks = getUnassignedTasks(step, tasks);
  const hiddenApproverLabels = getHiddenApproverLabels(step);
  const hasVisibilityRestrictions = hiddenApproverLabels.length > 0;
  const stepMode = step.mode ?? ApprovalStepMode.Any;

  return (
    <ApprovalStatusLineSection
      color={statusColor ?? getStepStatusLineColor(stepStatus)}
      label={statusLabel ?? getStepStatusLabel(stepStatus)}
      lineVariant={lineVariant}
      sx={approvalStepBlockSx}
    >
      <Stack spacing={Dialogs.stepStackSpacing}>
        <Stack
          direction="row"
          spacing={Dialogs.stepHeaderSpacing}
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
            <Box sx={stepHeaderActionsSx}>
              <Tooltip title="Completion rule">
                <IconButton
                  aria-label={`Step ${step.sequence} completion rule`}
                  size="small"
                  onClick={(event) => setModeAnchor(event.currentTarget)}
                >
                  {stepMode === ApprovalStepMode.All
                    ? <ChecklistRtlOutlined color={Icons.secondaryColor} fontSize="small" />
                    : <RuleOutlined color={Icons.secondaryColor} fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Popover
                open={Boolean(modeAnchor)}
                anchorEl={modeAnchor}
                onClose={() => setModeAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <Box sx={visibilityPopoverSx}>
                  <Typography variant="body2">
                    {getStepModeSummary(stepMode)}
                  </Typography>
                </Box>
              </Popover>
              {hasVisibilityRestrictions && (
                <>
                  <Tooltip title="Step visibility">
                    <IconButton
                      aria-label={`Step ${step.sequence} visibility`}
                      size="small"
                      onClick={(event) => setVisibilityAnchor(event.currentTarget)}
                    >
                      <VisibilityOff color={Icons.secondaryColor} fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Popover
                    open={Boolean(visibilityAnchor)}
                    anchorEl={visibilityAnchor}
                    onClose={() => setVisibilityAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  >
                    <Box sx={visibilityPopoverSx}>
                      {renderVisibilitySummary(hiddenApproverLabels)}
                    </Box>
                  </Popover>
                </>
              )}
            </Box>
            {headerAccessory}
          </Stack>
        </Stack>
        <Stack spacing={Dialogs.approverStackSpacing} sx={contentSx}>
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
      </Stack>
    </ApprovalStatusLineSection>
  );
};

export default ApprovalStepBlock;
