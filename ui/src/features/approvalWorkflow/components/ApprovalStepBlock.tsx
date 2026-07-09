import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Dialogs, Flex, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

interface ApprovalStepBlockProps {
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
}

const approvalStepBlockSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  p: 1.5,
};

const approvalStepHeaderSx = { mb: 1 };
const approvalTaskDetailsSx = { mt: 0.75 };

const getApproverTasks = (
  tasks: ApprovalRequestTask[],
  approverId: number | undefined,
) => {
  if (!approverId) {
    return [];
  }
  return tasks
    .filter(Boolean)
    .filter(
      (task) =>
        (
          task as ApprovalRequestTask & {
            approvalRequestStepApproverId?: number;
          }
        ).approvalRequestStepApproverId === approverId,
    );
};

const getApproverStatusLabel = (tasks: ApprovalRequestTask[]) => {
  if (tasks.length === 0) {
    return "Waiting";
  }
  if (
    tasks.some((task) => task.status === ApprovalRequestTaskStatus.Rejected)
  ) {
    return "Rejected";
  }
  if (
    tasks.some((task) => task.status === ApprovalRequestTaskStatus.Approved)
  ) {
    return "Approved";
  }
  if (
    tasks.every((task) => task.status === ApprovalRequestTaskStatus.Skipped)
  ) {
    return "Skipped";
  }
  return "Pending";
};

const getApproverStatusColor = (tasks: ApprovalRequestTask[]) => {
  if (
    tasks.some((task) => task.status === ApprovalRequestTaskStatus.Rejected)
  ) {
    return "error" as const;
  }
  if (
    tasks.some((task) => task.status === ApprovalRequestTaskStatus.Approved)
  ) {
    return "success" as const;
  }
  if (
    tasks.every((task) => task.status === ApprovalRequestTaskStatus.Skipped)
  ) {
    return "default" as const;
  }
  return "warning" as const;
};

const getApproverLabel = (
  approver: ApprovalStep["approvers"][number],
) => {
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

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  step,
  tasks,
}) => {
  return (
    <Box sx={approvalStepBlockSx}>
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
          label={
            step.mode === ApprovalStepMode.All ? "All required" : "Any one"
          }
          size="small"
          variant="outlined"
        />
      </Stack>
      <Stack divider={<Divider flexItem />} spacing={StackSpacing.default}>
        {(step.approvers ?? []).filter(Boolean).map((approver, index) => {
          const approverTasks = getApproverTasks(tasks, approver.id);
          return (
            <Box key={approver.id ?? index}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={StackSpacing.default}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography variant="body2" sx={Flex.growSx}>
                  {getApproverLabel(approver)}
                </Typography>
                <Chip
                  label={getApproverStatusLabel(approverTasks)}
                  color={getApproverStatusColor(approverTasks)}
                  size="small"
                />
              </Stack>
              {approverTasks.map((task) => (
                <Box key={task.id} sx={approvalTaskDetailsSx}>
                  <Typography variant="caption" color="text.secondary">
                    {task.approverDisplayName ??
                      task.approverEmail.toLowerCase()}
                    {task.completedAtDate
                      ? ` on ${getLocaleDateTimeString(task.completedAtDate)}`
                      : ""}
                  </Typography>
                  <CommentPaper text={task.comment} sx={Dialogs.sectionSx} />
                </Box>
              ))}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ApprovalStepBlock;
