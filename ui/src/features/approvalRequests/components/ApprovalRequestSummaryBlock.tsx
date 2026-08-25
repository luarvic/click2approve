import { stores } from "@/app/rootStore";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestDetailsCard, {
  requestCardBackgroundSx,
} from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestTimestamp from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getApprovalRequestTimestampIcon } from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import { getRequestCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import {
  getApprovalRequestStatusColor,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import { PlayCircleOutline } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
  approvalRequestTaskGlobalId?: string;
  defaultExpanded?: boolean;
  expandable?: boolean;
  limitWorkflowFields?: boolean;
}

const getStatusIconSx = (color: string): SxProps<Theme> => ({ color });

const getRequestCompletionLabel = (status: ApprovalRequestStatus): string | undefined => {
  switch (status) {
    case ApprovalRequestStatus.Completed:
      return "Completed by";
    case ApprovalRequestStatus.Canceled:
      return "Canceled by";
    case ApprovalRequestStatus.Superseded:
      return "Resubmitted by";
    default:
      return undefined;
  }
};

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
  approvalRequestTaskGlobalId,
  defaultExpanded,
  expandable,
  limitWorkflowFields = false,
}) => {
  const organizationIsVisible = stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const requesterType = approvalRequest.createdByEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User;
  const completionType = approvalRequest.completedByEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User;
  const completionLabel = getRequestCompletionLabel(approvalRequest.status);
  const completedTimestamp = getRequestCompletedTimestamp(approvalRequest);
  const completedBySystem =
    approvalRequest.status === ApprovalRequestStatus.Completed && !approvalRequest.completedByDisplayName;
  const completionDisplayName = completedBySystem
    ? "System"
    : (approvalRequest.completedByDisplayName ?? approvalRequest.createdByDisplayName);
  const completionEmail = completedBySystem
    ? undefined
    : (approvalRequest.completedByEmail ?? approvalRequest.createdByEmail);
  const requestStatusColor = getApprovalRequestStatusColor(approvalRequest.status, approvalRequest.result);
  const participantTimeline =
    completionLabel && completedTimestamp ? (
      <ApprovalRequestParticipantPair
        firstLabel={<ApprovalRequestParticipantLabel>Requested by</ApprovalRequestParticipantLabel>}
        firstParticipant={
          <ApprovalRequestParticipant
            displayName={approvalRequest.createdByDisplayName}
            email={approvalRequest.createdByEmail}
            organizationDisplayName={approvalRequest.organizationDisplayName}
            showOrganization={organizationIsVisible}
            type={requesterType}
          />
        }
        firstTimestamp={
          <ApprovalRequestTimestamp date={approvalRequest.createdAtDate} label="Requested at" type="created" />
        }
        secondLabel={<ApprovalRequestParticipantLabel>{completionLabel}</ApprovalRequestParticipantLabel>}
        secondParticipant={
          <ApprovalRequestParticipant
            displayName={completionDisplayName}
            email={completionEmail}
            isSystemParticipant={completedBySystem}
            organizationDisplayName={approvalRequest.organizationDisplayName}
            showOrganization={organizationIsVisible}
            type={completionType}
          />
        }
        secondTimestamp={
          <ApprovalRequestTimestamp
            date={completedTimestamp.date}
            label={completedTimestamp.label}
            type={completedTimestamp.type}
          />
        }
      />
    ) : (
      <ApprovalRequestParticipantPair
        firstLabel={<ApprovalRequestParticipantLabel>Requested by</ApprovalRequestParticipantLabel>}
        firstParticipant={
          <ApprovalRequestParticipant
            displayName={approvalRequest.createdByDisplayName}
            email={approvalRequest.createdByEmail}
            organizationDisplayName={approvalRequest.organizationDisplayName}
            showOrganization={organizationIsVisible}
            type={requesterType}
          />
        }
        firstTimestamp={
          <ApprovalRequestTimestampRow
            items={[
              {
                date: approvalRequest.createdAtDate,
                label: "Requested at",
                type: "created",
              },
              completedTimestamp,
            ]}
          />
        }
      />
    );
  void participantTimeline;
  const activity = (
    <ApprovalRequestFieldGroup title="Activity">
      <ApprovalRequestField
        label="Requested by"
        value={
          <ApprovalRequestParticipant
            displayName={approvalRequest.createdByDisplayName}
            email={approvalRequest.createdByEmail}
            organizationDisplayName={approvalRequest.organizationDisplayName}
            showOrganization={organizationIsVisible}
            type={requesterType}
            variant="body2"
          />
        }
      />
      <ApprovalRequestField
        label="Requested at"
        value={getLocaleDateTimeString(approvalRequest.createdAtDate)}
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
              organizationDisplayName={approvalRequest.organizationDisplayName}
              showOrganization={organizationIsVisible}
              type={completionType}
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

  return (
    <ApprovalRequestDetailsCard
      ariaLabel={getApprovalRequestStatusLabel(approvalRequest.status, approvalRequest.result)}
      borderLeftColor={requestStatusColor}
      borderLeftStyle={approvalRequest.status === ApprovalRequestStatus.Started ? "dotted" : "solid"}
      elevated
      sx={requestCardBackgroundSx}
    >
      <ApprovalRequestSummary
        activity={activity}
        title={approvalRequest.title}
        description={approvalRequest.description}
        approvalRequestGlobalId={approvalRequest.globalId}
        approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
        defaultExpanded={defaultExpanded}
        expandable={expandable}
        nextRevisionApprovalRequestGlobalId={
          approvalRequestTaskGlobalId ? undefined : approvalRequest.nextRevisionApprovalRequestGlobalId
        }
        previousRevisionApprovalRequestGlobalId={
          approvalRequestTaskGlobalId ? undefined : approvalRequest.previousRevisionApprovalRequestGlobalId
        }
        requestFiles={approvalRequest.requestFiles}
        revisionNumber={approvalRequest.revisionNumber}
        numberPrefix="Request"
        numberColor={approvalRequestTaskGlobalId ? "text.primary" : undefined}
        numberVariant="h5"
        showDescription={!limitWorkflowFields}
        showFiles={!limitWorkflowFields}
        showRevision={!limitWorkflowFields}
        showTitle={!approvalRequestTaskGlobalId}
        statusLabel={getApprovalRequestStatusLabel(approvalRequest.status, approvalRequest.result)}
        statusColor={requestStatusColor}
        statusIconSx={getStatusIconSx(requestStatusColor)}
        statusIcon={
          approvalRequest.status === ApprovalRequestStatus.Started ? (
            <PlayCircleOutline fontSize="inherit" sx={getStatusIconSx(requestStatusColor)} />
          ) : (
            getApprovalRequestTimestampIcon(
              approvalRequest.status === ApprovalRequestStatus.Canceled
                ? "canceled"
                : approvalRequest.status === ApprovalRequestStatus.Superseded
                  ? "superseded"
                  : approvalRequest.status === ApprovalRequestStatus.Pending
                    ? "pending"
                    : approvalRequest.result === false
                      ? "completedUnsuccessfully"
                      : "completedSuccessfully",
              "primary",
            )
          )
        }
        tenantGlobalId={tenantGlobalId}
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalRequestSummaryBlock;
