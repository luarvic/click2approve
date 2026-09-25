import { stores } from "@/app/rootStore";
import { getRequestCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestamp from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import { getApprovalRequestTimestampIcon } from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  getApprovalRequestStatusColor,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import { Business, PlayCircleOutlined } from "@mui/icons-material";
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
  const requesterType = approvalRequest.requesterEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User;
  const completionType = approvalRequest.completedByEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User;
  const organizationDisplayName =
    organizationIsVisible && approvalRequest.organizationDisplayName
      ? approvalRequest.organizationDisplayName
      : undefined;
  const completionLabel = getRequestCompletionLabel(approvalRequest.status);
  const completedTimestamp = getRequestCompletedTimestamp(approvalRequest);
  const completedBySystem =
    approvalRequest.status === ApprovalRequestStatus.Completed && !approvalRequest.completedByDisplayName;
  const completionDisplayName = completedBySystem
    ? "System"
    : (approvalRequest.completedByDisplayName ?? approvalRequest.requesterDisplayName);
  const completionEmail = completedBySystem
    ? undefined
    : (approvalRequest.completedByEmail ?? approvalRequest.requesterEmail);
  const requestStatusColor = getApprovalRequestStatusColor(approvalRequest.status, approvalRequest.result);
  const participantTimeline =
    completionLabel && completedTimestamp ? (
      <ApprovalRequestParticipantPair
        firstLabel="Requested by"
        firstParticipant={
          <ApprovalRequestParticipant
            displayName={approvalRequest.requesterDisplayName}
            email={approvalRequest.requesterEmail}
            organizationDisplayName={approvalRequest.organizationDisplayName}
            showOrganization={organizationIsVisible}
            type={requesterType}
          />
        }
        firstTimestamp={
          <ApprovalRequestTimestamp date={approvalRequest.createdAtDate} label="Requested at" type="created" />
        }
        secondLabel={completionLabel}
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
        firstLabel="Requested by"
        firstParticipant={
          <ApprovalRequestParticipant
            displayName={approvalRequest.requesterDisplayName}
            email={approvalRequest.requesterEmail}
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
    <ApprovalRequestFieldGroup title="Activity" valueVariant="body2">
      {organizationDisplayName && (
        <ApprovalRequestField
          label="From organization"
          value={organizationDisplayName}
          valueIcon={<Business color="action" fontSize="small" />}
        />
      )}
      <ApprovalRequestField
        label="Requested by"
        value={
          <ApprovalRequestParticipant
            displayName={approvalRequest.requesterDisplayName}
            email={approvalRequest.requesterEmail}
            type={requesterType}
            variant="body2"
          />
        }
      />
      {approvalRequest.submittedByUserGlobalId !== approvalRequest.requesterUserGlobalId && (
        <ApprovalRequestField
          label="Submitted by"
          value={
            <ApprovalRequestParticipant
              displayName={approvalRequest.submittedByDisplayName}
              email={approvalRequest.submittedByEmail}
              type={approvalRequest.submittedByEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User}
              variant="body2"
            />
          }
        />
      )}
      <ApprovalRequestField label="Requested at" value={getLocaleDateTimeString(approvalRequest.createdAtDate)} />
      <ApprovalRequestField
        label="Completed by"
        value={
          completionLabel ? (
            <ApprovalRequestParticipant
              displayName={completionDisplayName}
              email={completionEmail}
              isSystemParticipant={completedBySystem}
              type={completionType}
              variant="body2"
            />
          ) : undefined
        }
      />
      <ApprovalRequestField
        label="Completed at"
        value={completedTimestamp ? getLocaleDateTimeString(completedTimestamp.date) : undefined}
      />
    </ApprovalRequestFieldGroup>
  );

  return (
    <ApprovalRequestDetailsCard
      ariaLabel={getApprovalRequestStatusLabel(approvalRequest.status, approvalRequest.result)}
      borderLeftColor={requestStatusColor}
      borderLeftStyle={approvalRequest.status === ApprovalRequestStatus.Started ? "dotted" : "solid"}
      elevated
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
            <PlayCircleOutlined fontSize="inherit" sx={getStatusIconSx(requestStatusColor)} />
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
