import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalStep, ApprovalStepMode } from "@/features/approvalWorkflow/models/approvalStep";

export const getApprovalStepStatus = (step: ApprovalStep, tasks: ApprovalRequestTask[]) => {
  if (tasks.length === 0) {
    return "Not started";
  }

  if (step.mode === ApprovalStepMode.All) {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === false)) {
      return "Failed";
    }
    if (tasks.every((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === true)) {
      return "Succeeded";
    }
  } else {
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === true)) {
      return "Succeeded";
    }
    if (tasks.some((task) => task.status === ApprovalRequestTaskStatus.Completed && task.result === false)) {
      return "Failed";
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

export const getApprovalStepBorderLeftColor = (status: string) => {
  switch (status) {
    case "Succeeded":
      return "success.main";
    case "Failed":
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
