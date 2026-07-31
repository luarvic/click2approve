import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestIdentityVerificationView from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationView";
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
  VerifiedUserOutlined,
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
import ApprovalStepVisibilitySummary from "./ApprovalStepVisibilitySummary";

interface ApprovalStepBlockProps {
  contentSx?: SxProps<Theme>;
  headerAccessory?: ReactNode;
  lineVariant?: "solid" | "dotted";
  showVisibility?: boolean;
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
const stepTitleRowSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.tight,
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

const identityVerificationIconSx: SxProps<Theme> = {
  alignSelf: "center",
};

const renderIdentityVerificationIcon = (isRequested?: boolean) =>
  isRequested === true ? (
    <Tooltip title="Identity verification requested">
      <VerifiedUserOutlined
        color="secondary"
        fontSize="small"
        sx={identityVerificationIconSx}
      />
    </Tooltip>
  ) : null;

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
  const approver = step.approvers.find((item) => item.globalId === task.approvalRequestStepApproverGlobalId);
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

const taskIdentityVerificationIsVisible = (task: ApprovalRequestTask) =>
  task.requiresIdentityVerification === true &&
  task.status !== ApprovalRequestTaskStatus.Pending;

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
  label: string,
  icon: React.ReactNode,
) => {
  const completedAt = getTaskCompletionDate(task);

  return (
    <Stack key={task.globalId} spacing={StackSpacing.default}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={StackSpacing.tight}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <ApprovalRequestParticipantLine
          icon={icon}
          label={label}
        />
        {renderIdentityVerificationIcon(
          task.requiresIdentityVerification === true &&
          !taskIdentityVerificationIsVisible(task),
        )}
      </Stack>
      <ApprovalRequestComment label="Comment" text={task.comment} />
      {taskIdentityVerificationIsVisible(task) && (
        <ApprovalRequestIdentityVerificationView task={task} />
      )}
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
  <Stack
    key={approver.globalId ?? index}
    direction="row"
    spacing={StackSpacing.tight}
    alignItems="center"
  >
    <ApprovalRequestParticipantLine
      label={getApproverLabel(approver)}
      type={approver.type}
    />
    {renderIdentityVerificationIcon(approver.requiresIdentityVerification)}
  </Stack>
);

const renderTeamApprover = (
  approver: ApprovalStepApprover,
  approverTasks: ApprovalRequestTask[],
  index: number,
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
        <ApprovalRequestParticipantLine
          label={getApproverLabel(approver)}
          type={approver.type}
        />
        {renderIdentityVerificationIcon(approver.requiresIdentityVerification)}
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
  showVisibility = true,
  statusColor,
  statusLabel,
  step,
  tasks,
}) => {
  const [modeAnchor, setModeAnchor] = useState<HTMLElement | null>(null);
  const approvers = (step.approvers ?? []).filter(Boolean);
  const stepStatus = getStepStatus(step, tasks);
  const unassignedTasks = getUnassignedTasks(step, tasks);
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
            sx={Flex.growSx}
          >
            <Stack
              direction="row"
              sx={stepTitleRowSx}
            >
              <Typography variant="subtitle2">
                Step {step.sequence}
              </Typography>
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
              {showVisibility && <ApprovalStepVisibilitySummary inline step={step} />}
              {headerAccessory}
            </Stack>
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
