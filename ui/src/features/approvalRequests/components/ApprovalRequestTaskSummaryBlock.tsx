import { stores } from "@/app/rootStore";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestElectronicSignatureView from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureView";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestamp from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getTaskCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import {
  getApprovalRequestTaskStatusLabel,
  getApprovalRequestTaskStatusLineColor,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getApprovalRequestTaskCompletedActionLabel } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { StatusLineColors } from "@/shared/components/status/StatusLines";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { Box, Divider, Stack, Typography } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestTaskSummaryBlockProps {
  icon?: ReactNode;
  onClick?: () => void;
  participant?: "assignee" | "requester" | "none";
  participantType?: AssigneeType;
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
      : StatusLineColors[lineColor],
  };
};

const taskElectronicSignatureIsVisible = (task: ApprovalRequestTask) =>
  task.hasAssigneeSignature === true &&
  task.status !== ApprovalRequestTaskStatus.Pending;

const getTaskCompletionLabel = (task: ApprovalRequestTask): string | undefined => {
  switch (task.status) {
    case ApprovalRequestTaskStatus.Completed:
      return `${getApprovalRequestTaskCompletedActionLabel(task.action, task.result)} by`;
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped by";
    case ApprovalRequestTaskStatus.Canceled:
      return "Canceled by";
    default:
      return undefined;
  }
};

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
  const participantDisplayName = participant === "assignee"
    ? task.assigneeDisplayName
    : task.requestedByDisplayName;
  const participantEmail = participant === "assignee"
    ? task.assigneeEmail
    : requestedByEmail;
  const participantOrganizationDisplayName = task.organizationDisplayName;
  const resolvedParticipantType = participantType ??
    (participant === "assignee" && !task.assigneeUserId
      ? AssigneeType.User
      : AssigneeType.Employee);
  const taskBoxSx = getTaskBoxSx(task.status, task.result, isClickable);
  const completedTimestamp = getTaskCompletedTimestamp(task);
  const completionLabel = getTaskCompletionLabel(task);
  const completedBySystem = task.status === ApprovalRequestTaskStatus.Skipped
    || task.status === ApprovalRequestTaskStatus.Canceled;
  const completionDisplayName = completedBySystem
    ? "System"
    : task.completedByDisplayName ?? task.assigneeDisplayName;
  const completionEmail = completedBySystem
    ? undefined
    : task.completedByEmail || task.assigneeEmail;
  const completionType = resolvedParticipantType;

  return (
    <Box
      aria-label={getApprovalRequestTaskStatusLabel(task.status, task.action, task.result)}
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
          <>
            {completionLabel && completedTimestamp ? (
              <ApprovalRequestParticipantPair
                firstLabel={participant === "assignee" && (
                  <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
                )}
                firstParticipant={
                  <ApprovalRequestParticipant
                    icon={icon}
                    displayName={participantDisplayName}
                    email={participantEmail}
                    organizationDisplayName={participantOrganizationDisplayName}
                    showOrganization={organizationIsVisible}
                    type={resolvedParticipantType}
                  />
                }
                firstTimestamp={showTimeline && (
                  <ApprovalRequestTimestamp
                    date={task.createdAtDate}
                    label="Assigned at"
                    type="created"
                  />
                )}
                secondLabel={<ApprovalRequestParticipantLabel>{completionLabel}</ApprovalRequestParticipantLabel>}
                secondParticipant={
                  <ApprovalRequestParticipant
                    displayName={completionDisplayName}
                    email={completionEmail}
                    isSystemParticipant={completedBySystem}
                    organizationDisplayName={participantOrganizationDisplayName}
                    showOrganization={organizationIsVisible}
                    type={completedBySystem ? AssigneeType.Employee : completionType}
                  />
                }
                secondTimestamp={showTimeline && (
                  <ApprovalRequestTimestamp
                    date={completedTimestamp.date}
                    label={completedTimestamp.label}
                    type={completedTimestamp.type}
                  />
                )}
              />
            ) : (
              <ApprovalRequestParticipantPair
                firstLabel={participant === "assignee" && (
                  <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
                )}
                firstParticipant={
                  <ApprovalRequestParticipant
                    icon={icon}
                    displayName={participantDisplayName}
                    email={participantEmail}
                    organizationDisplayName={participantOrganizationDisplayName}
                    showOrganization={organizationIsVisible}
                    type={resolvedParticipantType}
                  />
                }
                firstTimestamp={showTimeline && (
                  <ApprovalRequestTimestampRow
                    items={[
                      {
                        date: task.createdAtDate,
                        label: "Assigned at",
                        type: "created",
                      },
                      completedTimestamp,
                    ]}
                  />
                )}
              />
            )}
          </>
        )}
        {showComment && task.comment?.trim() && (
          <>
            <Divider textAlign="center">
              <Typography color="text.secondary" variant="caption">Comment</Typography>
            </Divider>
            <ApprovalRequestComment text={task.comment} />
          </>
        )}
        {showElectronicSignature && taskElectronicSignatureIsVisible(task) && (
          <ApprovalRequestElectronicSignatureView task={task} />
        )}
        {showTimeline && participant === "none" && (
          <ApprovalRequestTimestampRow
            items={[
              {
                date: task.createdAtDate,
                label: "Assigned at",
                type: "created",
              },
              completedTimestamp,
            ]}
          />
        )}
      </Stack>
    </Box>
  );
};

export default ApprovalRequestTaskSummaryBlock;
