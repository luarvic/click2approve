import { stores } from "@/app/rootStore";
import ApprovalRequestElectronicSignatureView from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureView";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
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
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import { Stack } from "@mui/material";
import { StackSpacing } from "@/shared/constants/constants";
import type { TypographyProps } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalRequestTaskSummaryBlockProps {
  additionalMetadata?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  stepperBorderLeftColor?: string;
  numberColor?: TypographyProps["color"];
  numberVariant?: TypographyProps["variant"];
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

const getTaskBorderLeftColor = (status: ApprovalRequestTaskStatus, result: boolean | undefined): string => {
  const lineColor = getApprovalRequestTaskStatusLineColor(status, result);

  return lineColor === "other" ? "text.disabled" : StatusLineColors[lineColor];
};

const taskElectronicSignatureIsVisible = (task: ApprovalRequestTask) =>
  task.hasAssigneeSignature === true && task.status !== ApprovalRequestTaskStatus.Pending;

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
  additionalMetadata,
  icon,
  onClick,
  stepperBorderLeftColor,
  numberColor,
  numberVariant,
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
  const organizationIsVisible = stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const requestedByEmail = task.requestedByEmail ?? task.approvalRequest?.createdByEmail;
  const participantDisplayName = participant === "assignee" ? task.assigneeDisplayName : task.requestedByDisplayName;
  const participantEmail = participant === "assignee" ? task.assigneeEmail : requestedByEmail;
  const participantOrganizationDisplayName = task.organizationDisplayName;
  const resolvedParticipantType =
    participantType ?? (participant === "assignee" && !task.assigneeUserId ? AssigneeType.User : AssigneeType.Employee);
  const taskBorderLeftColor = getTaskBorderLeftColor(task.status, task.result);
  const completedTimestamp = getTaskCompletedTimestamp(task);
  const completionLabel = getTaskCompletionLabel(task);
  const completedBySystem =
    task.status === ApprovalRequestTaskStatus.Skipped || task.status === ApprovalRequestTaskStatus.Canceled;
  const completionDisplayName = completedBySystem
    ? "System"
    : (task.completedByDisplayName ?? task.assigneeDisplayName);
  const completionEmail = completedBySystem ? undefined : task.completedByEmail || task.assigneeEmail;
  const completionType = resolvedParticipantType;
  const hasMetadata =
    participant !== "none" ||
    (showComment && Boolean(task.comment?.trim())) ||
    Boolean(additionalMetadata) ||
    (showElectronicSignature && taskElectronicSignatureIsVisible(task)) ||
    (showTimeline && participant === "none");
  const metadata = hasMetadata ? (
    <Stack spacing={StackSpacing.default}>
      {participant !== "none" && (
        <>
          {completionLabel && completedTimestamp ? (
            <ApprovalRequestParticipantPair
              firstLabel={
                participant === "assignee" && (
                  <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
                )
              }
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
              firstTimestamp={
                showTimeline && (
                  <ApprovalRequestTimestamp date={task.createdAtDate} label="Assigned at" type="created" />
                )
              }
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
              secondTimestamp={
                showTimeline && (
                  <ApprovalRequestTimestamp
                    date={completedTimestamp.date}
                    label={completedTimestamp.label}
                    type={completedTimestamp.type}
                  />
                )
              }
            />
          ) : (
            <ApprovalRequestParticipantPair
              firstLabel={
                participant === "assignee" && (
                  <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
                )
              }
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
              firstTimestamp={
                showTimeline && (
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
                )
              }
            />
          )}
        </>
      )}
      {showComment && task.comment?.trim() && (
        <>
          <ApprovalRequestParticipantLabel>Comment</ApprovalRequestParticipantLabel>
          <UserProvidedText text={task.comment} />
        </>
      )}
      {additionalMetadata}
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
  ) : undefined;

  return (
    <ApprovalRequestDetailsCard
      ariaLabel={getApprovalRequestTaskStatusLabel(task.status, task.action, task.result)}
      borderLeftColor={stepperBorderLeftColor ?? taskBorderLeftColor}
      onClick={onClick}
    >
      <ApprovalRequestSummary
        title={task.title}
        description={task.description}
        approvalRequestTaskGlobalId={task.globalId}
        metadata={metadata}
        numberPrefix={taskNumberPrefix}
        numberColor={numberColor}
        numberVariant={numberVariant}
        requestFiles={task.requestFiles}
        revisionNumber={task.revisionNumber}
        showDescription={showDescription}
        showFileStateIndicators={false}
        showFiles={showFiles}
        showRevision={showRevision}
        showTitle={showTitle}
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalRequestTaskSummaryBlock;
