import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Flex, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { Email, Groups, Person } from "@mui/icons-material";
import { Chip, Divider, Stack, Typography } from "@mui/material";

interface ApprovalStepBlockProps {
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const approvalStepBlockSx = {
  px: 1.5,
  py: 1,
};

const approvalStepHeaderSx = { mb: 1 };

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

const getStepStatusColor = (step: ApprovalStep, tasks: ApprovalRequestTask[]) => {
  const status = getStepStatus(step, tasks);
  switch (status) {
    case "Approved":
      return "success" as const;
    case "Rejected":
      return "error" as const;
    case "Skipped":
      return "default" as const;
    default:
      return "warning" as const;
  }
};

const getApproverLabel = (approver: ApprovalStep["approvers"][number]) => {
  if (approver.displayName) {
    return approver.displayName;
  }
  if (approver.type === ApprovalRecipientType.Team) {
    return `Team #${approver.teamId}`;
  }
  if (approver.type === ApprovalRecipientType.Employee) {
    return `Employee #${approver.employeeId}`;
  }
  return approver.email?.toLowerCase() ?? "Approver";
};

const getTaskApproverLabel = (task: ApprovalRequestTask) =>
  task.approverDisplayName || task.approverEmail.toLowerCase();

const getApproverIcon = (type: ApprovalRecipientType) => {
  switch (type) {
    case ApprovalRecipientType.Employee:
      return <Person color="action" fontSize="small" />;
    case ApprovalRecipientType.Team:
      return <Groups color="action" fontSize="small" />;
    default:
      return <Email color="action" fontSize="small" />;
  }
};

const getTaskApproverIcon = (step: ApprovalStep, task: ApprovalRequestTask) => {
  const approver = step.approvers.find(
    (item) => item.id === task.approvalRequestStepApproverId,
  );
  return getApproverIcon(approver?.type ?? ApprovalRecipientType.Email);
};

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  step,
  tasks,
}) => {
  return (
    <Stack spacing={StackSpacing.default} sx={approvalStepBlockSx}>
      <Stack
        direction="row"
        spacing={StackSpacing.default}
        alignItems="center"
        sx={approvalStepHeaderSx}
      >
        <Typography variant="subtitle2" sx={Flex.growSx}>
          Step {step.sequence}
        </Typography>
        <Chip
          label={getStepStatus(step, tasks)}
          size="small"
          color={getStepStatusColor(step, tasks)}
        />
      </Stack>
      {tasks.length > 0
        ? tasks.map((task) => (
          <Stack key={task.id} spacing={StackSpacing.default}>
            <Stack
              direction="row"
              spacing={StackSpacing.tight}
              alignItems="center"
            >
              {getTaskApproverIcon(step, task)}
              <Typography variant="body2">
                {getTaskApproverLabel(task)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={StackSpacing.default}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Typography variant="caption" color="text.secondary">
                Created at {getLocaleDateTimeString(task.createdAtDate)}
              </Typography>
              {task.completedAtDate && (
                <Typography variant="caption" color="text.secondary">
                  {getTaskCompletionLabel(task.status)} {getLocaleDateTimeString(task.completedAtDate)}
                </Typography>
              )}
            </Stack>
            <ApprovalRequestComment text={task.comment} label="Comment" />
          </Stack>
        ))
        : (step.approvers ?? []).filter(Boolean).map((approver, index) => (
          <Stack key={approver.id ?? index} spacing={StackSpacing.default}>
            <Stack
              direction="row"
              spacing={StackSpacing.tight}
              alignItems="center"
            >
              {getApproverIcon(approver.type)}
              <Typography variant="body2">
                {getApproverLabel(approver)}
              </Typography>
            </Stack>
          </Stack>
        ))}
    </Stack>
  );
};

export default ApprovalStepBlock;
