import ApprovalRequestContentGroups from "@/features/approvalRequests/components/ApprovalRequestContentGroups";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestNumberText from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import ApprovalRequestRevisionLinks from "@/features/approvalRequests/components/ApprovalRequestRevisionLinks";
import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps, TypographyProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestSummaryProps {
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  description?: string;
  title?: string;
  requestFiles?: ApprovalRequestFile[];
  revisionNumber?: number;
  compareFilesWithPrevious?: boolean;
  numberPrefix?: string;
  numberColor?: TypographyProps["color"];
  nextRevisionApprovalRequestGlobalId?: string;
  numberVariant?: TypographyProps["variant"];
  previousRevisionApprovalRequestGlobalId?: string;
  metadata?: ReactNode;
  showFileStateIndicators?: boolean;
  showDescription?: boolean;
  showFiles?: boolean;
  showRevision?: boolean;
  showTitle?: boolean;
  tenantGlobalId?: string | null;
  titleVariant?: TypographyProps["variant"];
}

const summaryTitleSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
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
  numberColor,
  nextRevisionApprovalRequestGlobalId,
  numberVariant = "h6",
  previousRevisionApprovalRequestGlobalId,
  metadata,
  showFileStateIndicators = true,
  showDescription = true,
  showFiles = true,
  showRevision = true,
  showTitle = true,
  tenantGlobalId,
  titleVariant = "h6",
}) => {
  const numberGlobalId = approvalRequestGlobalId ?? approvalRequestTaskGlobalId;
  const hasDescription = showDescription && Boolean(description?.trim());
  const hasFiles = showFiles && Boolean(requestFiles?.length);
  const header = (
    <Stack spacing={StackSpacing.tight}>
      <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
        {showTitle && title && (
          <Typography component="h2" variant={titleVariant} sx={summaryTitleSx}>
            {title}
          </Typography>
        )}
        {showRevision && <ApprovalRequestRevisionChip revisionNumber={revisionNumber} />}
        {!showTitle && (
          <ApprovalRequestNumberText
            color={numberColor}
            globalId={numberGlobalId}
            prefix={numberPrefix}
            variant={numberVariant}
          />
        )}
      </Stack>
      <ApprovalRequestRevisionLinks
        nextRevisionApprovalRequestGlobalId={nextRevisionApprovalRequestGlobalId}
        previousRevisionApprovalRequestGlobalId={previousRevisionApprovalRequestGlobalId}
        tenantGlobalId={tenantGlobalId}
      />
    </Stack>
  );
  const content =
    hasDescription || hasFiles ? (
      <Stack spacing={StackSpacing.default}>
        {hasDescription && <UserProvidedText text={description} />}
        {hasFiles && (
          <ApprovalRequestFilesBox
            requestFiles={requestFiles}
            approvalRequestGlobalId={approvalRequestGlobalId}
            approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
            compareWithPrevious={compareFilesWithPrevious}
            showFileStateIndicators={showFileStateIndicators}
          />
        )}
      </Stack>
    ) : undefined;

  return <ApprovalRequestContentGroups content={content} header={header} metadata={metadata} />;
};

export default ApprovalRequestSummary;
