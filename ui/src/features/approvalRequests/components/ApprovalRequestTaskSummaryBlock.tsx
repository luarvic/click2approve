import { stores } from "@/app/rootStore";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestElectronicSignatureView from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureView";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getTaskCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import {
  ApprovalStatusLineColors,
  getApprovalRequestTaskStatusLabel,
  getApprovalRequestTaskStatusLineColor,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalRecipientType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { Box, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestTaskSummaryBlockProps {
  icon?: ReactNode;
  onClick?: () => void;
  participant?: "approver" | "requester" | "none";
  participantType?: ApprovalRecipientType;
  showComment?: boolean;
  showDescription?: boolean;
  showElectronicSignature?: boolean;
  showFiles?: boolean;
  showRevision?: boolean;
  showTimeline?: boolean;
  showTitle?: boolean;
  task: ApprovalRequestTask;
  taskNumberPrefix?: string;
}

const clickableTaskSx: SxProps<Theme> = {
  cursor: "pointer",
  "&:focus-visible": {
    borderRadius: 1,
    outline: "2px solid",
    outlineColor: "success.main",
    outlineOffset: 2,
  },
};

const getTaskBoxSx = (
  status: ApprovalRequestTaskStatus,
  result: boolean | undefined,
  isClickable: boolean,
): SxProps<Theme> => {
  const lineColor = getApprovalRequestTaskStatusLineColor(status, result);

  return {
    ...Dialogs.approvalBoxSx,
    ...(isClickable ? clickableTaskSx : {}),
    borderLeft: "3px solid",
    borderLeftColor: lineColor === "other"
      ? "text.disabled"
      : ApprovalStatusLineColors[lineColor],
  };
};

const taskElectronicSignatureIsVisible = (task: ApprovalRequestTask) =>
  task.hasApproverSignature === true &&
  task.status !== ApprovalRequestTaskStatus.Pending;

const ApprovalRequestTaskSummaryBlock: React.FC<ApprovalRequestTaskSummaryBlockProps> = ({
  icon,
  onClick,
  participant = "requester",
  participantType,
  showComment = false,
  showDescription = true,
  showElectronicSignature = false,
  showFiles = true,
  showRevision = true,
  showTimeline = true,
  showTitle = true,
  task,
  taskNumberPrefix,
}) => {
  const isClickable = Boolean(onClick);
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const requestedByEmail = task.requestedByEmail ?? task.approvalRequest?.createdByEmail;
  const participantDisplayName = participant === "approver"
    ? task.approverDisplayName
    : task.requestedByDisplayName;
  const participantEmail = participant === "approver"
    ? task.approverEmail
    : requestedByEmail;
  const participantOrganizationDisplayName = participant === "approver"
    ? task.approverOrganizationDisplayName
    : task.createdByOrganizationDisplayName;
  const resolvedParticipantType = participantType ??
    (participant === "approver" && !task.approverUserId
      ? ApprovalRecipientType.Email
      : ApprovalRecipientType.Employee);
  const taskBoxSx = getTaskBoxSx(task.status, task.result, isClickable);

  return (
    <Box
      aria-label={getApprovalRequestTaskStatusLabel(task.status, task.result)}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable
        ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.();
          }
        }
        : undefined}
      role={isClickable ? "button" : undefined}
      sx={taskBoxSx}
      tabIndex={isClickable ? 0 : undefined}
    >
      <Stack spacing={StackSpacing.default}>
        <ApprovalRequestSummary
          title={task.title}
          description={task.description}
          approvalRequestTaskGlobalId={task.globalId}
          numberPrefix={taskNumberPrefix}
          requestFiles={task.requestFiles}
          revisionNumber={task.revisionNumber}
          showDescription={showDescription}
          showFileStateIndicators={false}
          showFiles={showFiles}
          showRevision={showRevision}
          showTitle={showTitle}
        />
        {participant !== "none" && (
          <ApprovalRequestParticipant
            icon={icon}
            displayName={participantDisplayName}
            email={participantEmail}
            organizationDisplayName={participantOrganizationDisplayName}
            showOrganization={organizationIsVisible}
            type={resolvedParticipantType}
          />
        )}
        {showComment && <ApprovalRequestComment label="Comment" text={task.comment} />}
        {showElectronicSignature && taskElectronicSignatureIsVisible(task) && (
          <ApprovalRequestElectronicSignatureView task={task} />
        )}
        {showTimeline && (
          <ApprovalRequestTimestampRow
            items={[
            {
              date: task.createdAtDate,
              label: "Created at",
              type: "created",
            },
            getTaskCompletedTimestamp(task),
            ]}
          />
        )}
      </Stack>
    </Box>
  );
};

export default ApprovalRequestTaskSummaryBlock;
