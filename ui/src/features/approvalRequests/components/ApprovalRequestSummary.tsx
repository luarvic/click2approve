import ApprovalRequestCardLayout from "@/features/approvalRequests/components/ApprovalRequestCardLayout";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionLinks from "@/features/approvalRequests/components/ApprovalRequestRevisionLinks";
import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import { StackSpacing } from "@/shared/theme/tokens";
import type { TypographyProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ElementType, ReactNode } from "react";

interface ApprovalRequestSummaryProps {
  additionalContent?: ReactNode;
  activity?: ReactNode;
  artifacts?: ReactNode;
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  description?: string;
  defaultExpanded?: boolean;
  expandable?: boolean;
  instructions?: string;
  nextRevisionApprovalRequestGlobalId?: string;
  numberPrefix?: string;
  previousRevisionApprovalRequestGlobalId?: string;
  requestFiles?: ApprovalRequestFile[];
  revisionNumber?: number;
  metadata?: ReactNode;
  numberColor?: TypographyProps["color"];
  numberComponent?: ElementType;
  numberVariant?: string;
  showFileStateIndicators?: boolean;
  showDescription?: boolean;
  showFiles?: boolean;
  showInstructions?: boolean;
  showRevision?: boolean;
  showStatus?: boolean;
  showTitle?: boolean;
  statusLabel?: string;
  statusColor?: TypographyProps["color"];
  statusIcon?: ReactNode;
  statusIconSx?: SxProps<Theme>;
  tenantGlobalId?: string | null;
  title?: string;
}

const revisionValueSx: SxProps<Theme> = {
  display: "inline-flex",
};

const ApprovalRequestSummary: React.FC<ApprovalRequestSummaryProps> = ({
  additionalContent,
  activity,
  artifacts,
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  description,
  defaultExpanded,
  expandable,
  instructions,
  nextRevisionApprovalRequestGlobalId,
  metadata,
  numberPrefix: _numberPrefix = "Request",
  previousRevisionApprovalRequestGlobalId,
  requestFiles,
  revisionNumber,
  showFileStateIndicators,
  showDescription = true,
  showFiles = true,
  showInstructions = false,
  showRevision = true,
  showStatus = true,
  statusLabel,
  statusColor,
  statusIcon,
  statusIconSx,
  tenantGlobalId,
}) => {
  const numberGlobalId = approvalRequestGlobalId ?? approvalRequestTaskGlobalId;
  const hasFiles = Boolean(requestFiles?.length);

  const details = (
    <ApprovalRequestFieldGroup title="Details">
      {showStatus && (
        <ApprovalRequestField
          label="Status"
          value={statusLabel}
          valueColor={statusColor}
          valueIcon={statusIcon}
          valueIconSx={statusIconSx}
        />
      )}
      {showRevision && (
        <ApprovalRequestField
          label="Revision"
          value={
            <Stack
              component="span"
              direction="row"
              spacing={StackSpacing.tight}
              alignItems="center"
              sx={revisionValueSx}
            >
              <Typography component="span" variant="body1">
                {revisionNumber ?? 1}
              </Typography>
              <ApprovalRequestRevisionLinks
                leadingDivider
                nextRevisionApprovalRequestGlobalId={nextRevisionApprovalRequestGlobalId}
                previousRevisionApprovalRequestGlobalId={previousRevisionApprovalRequestGlobalId}
                tenantGlobalId={tenantGlobalId}
              />
            </Stack>
          }
        />
      )}
      {showDescription && (
        <ApprovalRequestField
          label="Description"
          value={description?.trim() ? <UserProvidedText text={description} /> : undefined}
        />
      )}
      {showInstructions && (
        <ApprovalRequestField
          label="Instructions"
          value={instructions?.trim() ? <UserProvidedText text={instructions} /> : undefined}
        />
      )}
      {showFiles && (
        <ApprovalRequestField
          label="Files to review"
          value={
            hasFiles ? (
              <ApprovalRequestFilesBox
                approvalRequestGlobalId={approvalRequestGlobalId}
                approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
                compareWithPrevious={(revisionNumber ?? 1) > 1}
                requestFiles={requestFiles}
                showFileStateIndicators={showFileStateIndicators ?? (revisionNumber ?? 1) > 1}
              />
            ) : undefined
          }
        />
      )}
    </ApprovalRequestFieldGroup>
  );

  return (
    <ApprovalRequestCardLayout
      activity={activity ?? additionalContent}
      artifacts={artifacts ?? metadata}
      defaultExpanded={defaultExpanded}
      details={details}
      expandable={expandable}
      title={`${_numberPrefix} ${getApprovalRequestNumber(numberGlobalId)}`}
    />
  );
};

export default ApprovalRequestSummary;
