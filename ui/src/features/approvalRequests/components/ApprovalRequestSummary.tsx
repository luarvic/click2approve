import ApprovalRequestContentGroups from "@/features/approvalRequests/components/ApprovalRequestContentGroups";
import { useApprovalRequestDetailsCardMode } from "@/features/approvalRequests/components/ApprovalRequestDetailsCardContext";
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
import type { ElementType, ReactNode } from "react";

interface ApprovalRequestSummaryProps {
  additionalContent?: ReactNode;
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  description?: string;
  title?: string;
  requestFiles?: ApprovalRequestFile[];
  revisionNumber?: number;
  numberPrefix?: string;
  numberColor?: TypographyProps["color"];
  numberComponent?: ElementType;
  nextRevisionApprovalRequestGlobalId?: string;
  numberVariant?: TypographyProps["variant"];
  previousRevisionApprovalRequestGlobalId?: string;
  metadata?: ReactNode;
  showDescription?: boolean;
  showFileStateIndicators?: boolean;
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
  additionalContent,
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  description,
  title,
  requestFiles,
  revisionNumber,
  numberPrefix,
  numberColor,
  numberComponent,
  nextRevisionApprovalRequestGlobalId,
  numberVariant = "h6",
  previousRevisionApprovalRequestGlobalId,
  metadata,
  showDescription = true,
  showFileStateIndicators,
  showFiles = true,
  showRevision = true,
  showTitle = true,
  tenantGlobalId,
  titleVariant = "h5",
}) => {
  const detailsCardMode = useApprovalRequestDetailsCardMode();
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
            component={numberComponent}
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
    hasDescription || hasFiles || additionalContent ? (
      <Stack spacing={StackSpacing.default}>
        {hasDescription && <UserProvidedText text={description} />}
        {hasFiles && (
          <ApprovalRequestFilesBox
            requestFiles={requestFiles}
            approvalRequestGlobalId={approvalRequestGlobalId}
            approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
            compareWithPrevious={detailsCardMode === "edit" && (revisionNumber ?? 1) > 1}
            showFileStateIndicators={showFileStateIndicators ?? detailsCardMode === "edit"}
          />
        )}
        {additionalContent}
      </Stack>
    ) : undefined;

  return <ApprovalRequestContentGroups content={content} header={header} metadata={metadata} />;
};

export default ApprovalRequestSummary;
