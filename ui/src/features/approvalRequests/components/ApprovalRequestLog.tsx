import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import {
  ApprovalRecipientType,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { Box, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestLogProps {
  approvalRequest?: ApprovalRequest | null;
}

interface ApprovalRequestLogEntry {
  action: string;
  date: Date;
  details: string;
  id: string;
  party: string;
  partyType: string;
}

const approvalRequestLogRecordsSx: SxProps<Theme> = {
  ...Dialogs.tabContentSx,
};

const approvalRequestLogRecordSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  p: 1.5,
};

const approvalRequestLogRecordLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  flexShrink: 0,
  minWidth: "7rem",
};

const approvalRequestLogRecordValueSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const detailsRecordValueSx: SxProps<Theme> = { whiteSpace: "pre-wrap" };

const getAction = (status: ApprovalRequestTaskStatus) => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped";
    default:
      return "Pending";
  }
};

const getPartyType = (type?: ApprovalRecipientType) => {
  switch (type) {
    case ApprovalRecipientType.Employee:
      return "Employee";
    case ApprovalRecipientType.Team:
      return "Team";
    default:
      return "Email";
  }
};

const getSteps = (approvalRequest: ApprovalRequest) =>
  (approvalRequest.steps ?? []).filter(Boolean);

const getTaskApprover = (
  approvalRequest: ApprovalRequest,
  task: ApprovalRequestTask,
): ApprovalStepApprover | undefined => {
  const step = getSteps(approvalRequest).find(
    (item) => item.id === task.approvalRequestStepId,
  );
  return (step?.approvers ?? []).filter(Boolean).find(
    (approver) =>
      approver.id === task.approvalRequestStepApproverId ||
      approver.email?.toLowerCase() === task.approverEmail.toLowerCase() ||
      approver.displayName === task.approverDisplayName,
  );
};

const getTasks = (approvalRequest: ApprovalRequest) => {
  const tasks = [
    ...(approvalRequest.tasks ?? []),
    ...getSteps(approvalRequest).flatMap((step) => step.tasks ?? []),
  ].filter((task): task is ApprovalRequestTask => Boolean(task));

  return tasks.filter(
    (task, index, tasks) =>
      tasks.findIndex((item) => item.id === task.id) === index,
  );
};

const getLogEntries = (approvalRequest: ApprovalRequest): ApprovalRequestLogEntry[] => {
  const requestCreatedEntry: ApprovalRequestLogEntry = {
    action: "Created",
    date: approvalRequest.createdAtDate,
    details: approvalRequest.description ?? "",
    id: "request-created",
    party: approvalRequest.authorEmail.toLowerCase(),
    partyType: "User",
  };
  const taskEntries = getTasks(approvalRequest).map((task) => {
    const approver = getTaskApprover(approvalRequest, task);
    return {
      action: getAction(task.status),
      date: task.completedAtDate ?? task.createdAtDate,
      details: task.comment ?? "",
      id: `task-${task.id}`,
      party:
        task.approverDisplayName ??
        approver?.displayName ??
        task.approverEmail.toLowerCase(),
      partyType: getPartyType(
        approver?.type ??
        (task.approverDisplayName
          ? ApprovalRecipientType.Employee
          : ApprovalRecipientType.Email),
      ),
    };
  });

  return [requestCreatedEntry, ...taskEntries].sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  );
};

const getRecordRows = (entry: ApprovalRequestLogEntry) => [
  { label: "Timestamp", value: getLocaleDateTimeString(entry.date) },
  { label: "Event", value: entry.action },
  { label: "Actor type", value: entry.partyType },
  { label: "Actor", value: entry.party },
  { label: "Details", value: entry.details },
];

const ApprovalRequestLog: React.FC<ApprovalRequestLogProps> = ({ approvalRequest }) => {
  if (!approvalRequest) {
    return null;
  }

  const entries = getLogEntries(approvalRequest);

  return (
    <Stack spacing={Dialogs.formStackSpacing} sx={approvalRequestLogRecordsSx}>
      {entries.map((entry) => (
        <Box key={entry.id} sx={approvalRequestLogRecordSx}>
          {getRecordRows(entry).map((row) => (
            <Stack key={row.label} direction="row" spacing={StackSpacing.default}>
              <Box component="span" sx={approvalRequestLogRecordLabelSx}>
                {row.label}
              </Box>
              <Box
                component="span"
                sx={
                  row.label === "Details"
                    ? [approvalRequestLogRecordValueSx, detailsRecordValueSx]
                    : approvalRequestLogRecordValueSx
                }
              >
                {row.value}
              </Box>
            </Stack>
          ))}
        </Box>
      ))}
    </Stack>
  );
};

export default ApprovalRequestLog;
