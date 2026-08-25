import { stores } from "@/app/rootStore";
import { getTaskCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import ApprovalRequestDetailsCard, {
  taskCardBackgroundSx,
} from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestElectronicSignatureView from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureView";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestamp from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getApprovalRequestTimestampIcon } from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import {
  getApprovalRequestTaskStatusColor,
  getApprovalRequestTaskStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskCompletedActionLabel } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import { StackSpacing } from "@/shared/constants/constants";
import type { TypographyProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { ElementType, ReactNode } from "react";

interface ApprovalRequestTaskSummaryBlockProps {
  additionalMetadata?: ReactNode;
  defaultExpanded?: boolean;
  expandable?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  stepperBorderLeftColor?: string;
  numberColor?: TypographyProps["color"];
  numberComponent?: ElementType;
  numberVariant?: TypographyProps["variant"];
  participant?: "assignee" | "requester" | "none";
  participantType?: AssigneeType;
  showComment?: boolean;
  showDescription?: boolean;
  showElectronicSignature?: boolean;
  showFiles?: boolean;
  showInstructions?: boolean;
  showInstructionsLabel?: boolean;
  showRevision?: boolean;
  showRequester?: boolean;
  showTimeline?: boolean;
  showTitle?: boolean;
  task: ApprovalRequestTask;
  taskNumberPrefix?: string;
}

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
  defaultExpanded,
  expandable,
  icon,
  onClick,
  stepperBorderLeftColor,
  numberColor,
  numberComponent,
  numberVariant,
  participant = "requester",
  participantType,
  showComment = false,
  showDescription = true,
  showElectronicSignature = false,
  showFiles = true,
  showInstructions = true,
  showInstructionsLabel = true,
  showRevision = true,
  showRequester = false,
  showTimeline = true,
  showTitle = true,
  task,
  taskNumberPrefix: _taskNumberPrefix,
}) => {
  const organizationIsVisible = stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const requestedByEmail = task.requestedByEmail ?? task.approvalRequest?.createdByEmail;
  const participantDisplayName = participant === "assignee" ? task.assigneeDisplayName : task.requestedByDisplayName;
  const participantEmail = participant === "assignee" ? task.assigneeEmail : requestedByEmail;
  const participantOrganizationDisplayName = task.organizationDisplayName;
  const resolvedParticipantType =
    participantType ?? (participant === "assignee" ? AssigneeType.User : AssigneeType.Employee);
  const requesterParticipantType = task.approvalRequest
    ? task.approvalRequest.createdByEmployeeGlobalId
      ? AssigneeType.Employee
      : AssigneeType.User
    : participant === "assignee"
      ? resolvedParticipantType
      : AssigneeType.User;
  const taskStatusColor = getApprovalRequestTaskStatusColor(task.status, task.result);
  const completedTimestamp = getTaskCompletedTimestamp(task);
  const completionLabel = getTaskCompletionLabel(task);
  const completedBySystem =
    task.status === ApprovalRequestTaskStatus.Skipped || task.status === ApprovalRequestTaskStatus.Canceled;
  const completionDisplayName = completedBySystem
    ? "System"
    : (task.completedByDisplayName ?? task.assigneeDisplayName);
  const completionEmail = completedBySystem ? undefined : task.completedByEmail || task.assigneeEmail;
  const completionType = resolvedParticipantType;
  const participants =
    participant !== "none" ? (
      completionLabel && completedTimestamp ? (
        <ApprovalRequestParticipantPair
          firstLabel={
            participant === "assignee" && <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
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
            showTimeline && <ApprovalRequestTimestamp date={task.createdAtDate} label="Assigned at" type="created" />
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
            participant === "assignee" && <ApprovalRequestParticipantLabel>Assigned to</ApprovalRequestParticipantLabel>
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
      )
    ) : undefined;
  const taskContent =
    (showInstructions && task.instructions?.trim()) || participants || showRequester ? (
      <>
        {showInstructions && task.instructions?.trim() && (
          <>
            {showInstructionsLabel && <ApprovalRequestParticipantLabel>Instructions</ApprovalRequestParticipantLabel>}
            <UserProvidedText text={task.instructions} />
          </>
        )}
        {participants}
        {showRequester && (
          <Stack spacing={StackSpacing.tight}>
            <ApprovalRequestParticipantLabel>Requested by</ApprovalRequestParticipantLabel>
            <ApprovalRequestParticipant
              displayName={task.requestedByDisplayName}
              email={requestedByEmail}
              organizationDisplayName={participantOrganizationDisplayName}
              showOrganization={organizationIsVisible}
              type={requesterParticipantType}
            />
          </Stack>
        )}
      </>
    ) : undefined;
  void taskContent;
  const activity = (
    <ApprovalRequestFieldGroup title="Activity">
      {showRequester && (
        <ApprovalRequestField
          label="Requested by"
          value={
            <ApprovalRequestParticipant
              displayName={task.requestedByDisplayName}
              email={requestedByEmail}
              organizationDisplayName={participantOrganizationDisplayName}
              showOrganization={organizationIsVisible}
              type={requesterParticipantType}
              variant="body2"
            />
          }
        />
      )}
      <ApprovalRequestField
        label={participant === "assignee" ? "Assigned to" : "Requested by"}
        value={
          participant === "none" ? undefined : (
            <ApprovalRequestParticipant
              icon={icon}
              displayName={participantDisplayName}
              email={participantEmail}
              organizationDisplayName={participantOrganizationDisplayName}
              showOrganization={organizationIsVisible}
              type={resolvedParticipantType}
              variant="body2"
            />
          )
        }
      />
      <ApprovalRequestField
        label="Assigned at"
        value={getLocaleDateTimeString(task.createdAtDate)}
        valueVariant="body2"
      />
      <ApprovalRequestField
        label="Completed by"
        value={
          completionLabel ? (
            <ApprovalRequestParticipant
              displayName={completionDisplayName}
              email={completionEmail}
              isSystemParticipant={completedBySystem}
              organizationDisplayName={participantOrganizationDisplayName}
              showOrganization={organizationIsVisible}
              type={completedBySystem ? AssigneeType.Employee : completionType}
              variant="body2"
            />
          ) : undefined
        }
      />
      <ApprovalRequestField
        label="Completed at"
        value={completedTimestamp ? getLocaleDateTimeString(completedTimestamp.date) : undefined}
        valueVariant="body2"
      />
    </ApprovalRequestFieldGroup>
  );
  const hasMetadata =
    (showComment && Boolean(task.comment?.trim())) ||
    Boolean(additionalMetadata) ||
    (showElectronicSignature && taskElectronicSignatureIsVisible(task)) ||
    (showTimeline && participant === "none");
  const metadata = hasMetadata ? (
    <Stack spacing={StackSpacing.default}>
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
      borderLeftColor={stepperBorderLeftColor ?? taskStatusColor}
      elevated
      onClick={onClick}
      sx={taskCardBackgroundSx}
    >
      <ApprovalRequestSummary
        activity={activity}
        title={task.title}
        description={task.description}
        defaultExpanded={defaultExpanded}
        expandable={expandable}
        instructions={showInstructions ? task.instructions : undefined}
        approvalRequestTaskGlobalId={task.globalId}
        artifacts={
          metadata ? <ApprovalRequestFieldGroup title="Artifacts">{metadata}</ApprovalRequestFieldGroup> : undefined
        }
        numberPrefix="Task"
        numberColor={numberColor}
        numberComponent={numberComponent}
        numberVariant={numberVariant}
        requestFiles={task.requestFiles}
        revisionNumber={task.revisionNumber}
        showDescription={showDescription}
        showFiles={showFiles}
        showInstructions={showInstructions}
        showRevision={showRevision}
        showTitle={showTitle}
        statusLabel={getApprovalRequestTaskStatusLabel(task.status, task.action, task.result)}
        statusColor={taskStatusColor}
        statusIconSx={{ color: taskStatusColor }}
        statusIcon={getApprovalRequestTimestampIcon(
          task.status === ApprovalRequestTaskStatus.Skipped
            ? "skipped"
            : task.status === ApprovalRequestTaskStatus.Canceled
              ? "canceled"
              : task.status === ApprovalRequestTaskStatus.Pending
                ? "pending"
                : task.result === false
                  ? "completedUnsuccessfully"
                  : "completedSuccessfully",
          "primary",
        )}
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalRequestTaskSummaryBlock;
