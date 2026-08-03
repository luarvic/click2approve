import ApprovalRequestParticipantLine, {
  getApprovalRecipientIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import DisplayName from "@/shared/components/identity/DisplayName";
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
  highlightedTaskGlobalId?: string;
  onHighlightedTaskClick?: () => void;
  showVisibility?: boolean;
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

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
  pl: 0,
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

const getStepStatusLabel = (status: string) => {
  switch (status) {
    case "Rejected":
      return "Change requested";
    default:
      return status;
  }
};

const getApproverLabel = (approver: ApprovalStep["approvers"][number]) => (
  <DisplayName
    displayName={approver.displayName}
    email={approver.email}
  />
);

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
  isCurrentTask: boolean,
  onCurrentTaskClick?: () => void,
) => (
  <ApprovalRequestTaskSummaryBlock
    key={task.globalId}
    icon={icon}
    onClick={isCurrentTask ? onCurrentTaskClick : undefined}
    participant="approver"
    showComment
    showDescription={false}
    showFiles={false}
    showIdentityVerification
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
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
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
              <Person color="action" fontSize="small" />,
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
  </Accordion>
);

const renderApprover = (
  step: ApprovalStep,
  approver: ApprovalStepApprover,
  tasks: ApprovalRequestTask[],
  index: number,
  highlightedTaskGlobalId?: string,
  onHighlightedTaskClick?: () => void,
) => {
  const approverTasks = getApproverTasks(approver, tasks);
  if (approver.type === ApprovalRecipientType.Team) {
    return renderTeamApprover(
      approver,
      approverTasks,
      index,
      highlightedTaskGlobalId,
      onHighlightedTaskClick,
    );
  }

  if (approverTasks.length === 0) {
    return renderApproverWithoutTasks(approver, index);
  }

  return approverTasks.map((task) =>
    renderTaskDetails(
      task,
      getTaskApproverIcon(step, task),
      task.globalId === highlightedTaskGlobalId,
      onHighlightedTaskClick,
    ),
  );
};

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  contentSx,
  headerAccessory,
  highlightedTaskGlobalId,
  onHighlightedTaskClick,
  showVisibility = true,
  step,
  tasks,
}) => {
  const [modeAnchor, setModeAnchor] = useState<HTMLElement | null>(null);
  const approvers = (step.approvers ?? []).filter(Boolean);
  const unassignedTasks = getUnassignedTasks(step, tasks);
  const stepStatus = getStepStatus(step, tasks);
  const stepMode = step.mode ?? ApprovalStepMode.Any;

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
            renderApprover(
              step,
              approver,
              tasks,
              index,
              highlightedTaskGlobalId,
              onHighlightedTaskClick,
            ),
          )}
          {unassignedTasks.map((task) =>
            renderTaskDetails(
              task,
              getTaskApproverIcon(step, task),
              task.globalId === highlightedTaskGlobalId,
              onHighlightedTaskClick,
            ),
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ApprovalStepBlock;
