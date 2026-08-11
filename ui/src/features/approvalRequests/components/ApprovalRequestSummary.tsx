import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestNumberText from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import ApprovalRequestRevisionLinks from "@/features/approvalRequests/components/ApprovalRequestRevisionLinks";
import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestSummaryProps {
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  description?: string;
  title?: string;
  requestFiles?: ApprovalRequestFile[];
  revisionNumber?: number;
  compareFilesWithPrevious?: boolean;
  numberPrefix?: string;
  nextRevisionApprovalRequestGlobalId?: string;
  previousRevisionApprovalRequestGlobalId?: string;
  showFileStateIndicators?: boolean;
  showDescription?: boolean;
  showFiles?: boolean;
  showRevision?: boolean;
  showTitle?: boolean;
  tenantGlobalId?: string | null;
}

const summaryTitleSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
};

const summaryDescriptionSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
};

const ApprovalRequestSummary: React.FC<ApprovalRequestSummaryProps> = ({
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  description,
  title,
  requestFiles,
  revisionNumber,
  compareFilesWithPrevious = false,
  numberPrefix,
  nextRevisionApprovalRequestGlobalId,
  previousRevisionApprovalRequestGlobalId,
  showFileStateIndicators = true,
  showDescription = true,
  showFiles = true,
  showRevision = true,
  showTitle = true,
  tenantGlobalId,
}) => {
  const trimmedDescription = description?.trim();
  const numberGlobalId = approvalRequestGlobalId ?? approvalRequestTaskGlobalId;

  return (
    <Stack spacing={StackSpacing.default}>
      <Stack spacing={StackSpacing.tight}>
        <Stack
          direction="row"
          spacing={StackSpacing.tight}
          alignItems="center"
        >
          {showTitle && title && (
            <Typography
              component="h2"
              variant="h6"
              sx={summaryTitleSx}
            >
              {title}
            </Typography>
          )}
          {showRevision && <ApprovalRequestRevisionChip revisionNumber={revisionNumber} />}
          {!showTitle && (
            <ApprovalRequestNumberText
              globalId={numberGlobalId}
              prefix={numberPrefix}
              variant="h6"
            />
          )}
        </Stack>
        <ApprovalRequestRevisionLinks
          nextRevisionApprovalRequestGlobalId={nextRevisionApprovalRequestGlobalId}
          previousRevisionApprovalRequestGlobalId={previousRevisionApprovalRequestGlobalId}
          tenantGlobalId={tenantGlobalId}
        />
      </Stack>
      {showDescription && trimmedDescription && (
        <Typography
          variant="body1"
          sx={summaryDescriptionSx}
        >
          {trimmedDescription}
        </Typography>
      )}
      {showFiles && (
        <ApprovalRequestFilesBox
          requestFiles={requestFiles}
          approvalRequestGlobalId={approvalRequestGlobalId}
          approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
          compareWithPrevious={compareFilesWithPrevious}
          showFileStateIndicators={showFileStateIndicators}
        />
      )}
    </Stack>
  );
};

export default ApprovalRequestSummary;
