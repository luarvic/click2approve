import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestNumberText from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import { StackSpacing } from "@/shared/constants/constants";
import { ChevronRight } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestSummaryProps {
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  description?: string;
  title: string;
  requestFiles?: ApprovalRequestFile[];
  revisionNumber?: number;
  compareFilesWithPrevious?: boolean;
  showFileStateIndicators?: boolean;
}

const summaryTitleSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
};

const summaryDescriptionSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
};

const summaryTitleSeparatorIconSx: SxProps<Theme> = {
  color: "text.disabled",
  flexShrink: 0,
  mx: StackSpacing.tight,
};

const ApprovalRequestSummary: React.FC<ApprovalRequestSummaryProps> = ({
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  description,
  title,
  requestFiles,
  revisionNumber,
  compareFilesWithPrevious = false,
  showFileStateIndicators = true,
}) => {
  const trimmedDescription = description?.trim();
  const numberGlobalId = approvalRequestTaskGlobalId ?? approvalRequestGlobalId;

  return (
    <Stack spacing={StackSpacing.default}>
      <Stack
        direction="row"
        spacing={StackSpacing.tight}
        alignItems="center"
      >
        <ApprovalRequestNumberText globalId={numberGlobalId} variant="h6" />
        <ChevronRight fontSize="small" sx={summaryTitleSeparatorIconSx} />
        <Typography
          component="h2"
          variant="h6"
          sx={summaryTitleSx}
        >
          {title}
        </Typography>
        <ApprovalRequestRevisionChip revisionNumber={revisionNumber} />
      </Stack>
      {trimmedDescription && (
        <Typography
          variant="body1"
          sx={summaryDescriptionSx}
        >
          {trimmedDescription}
        </Typography>
      )}
      <ApprovalRequestFilesBox
        requestFiles={requestFiles}
        approvalRequestGlobalId={approvalRequestGlobalId}
        approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
        compareWithPrevious={compareFilesWithPrevious}
        showFileStateIndicators={showFileStateIndicators}
      />
    </Stack>
  );
};

export default ApprovalRequestSummary;
