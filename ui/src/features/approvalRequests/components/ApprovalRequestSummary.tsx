import { ApprovalRequestFile } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import { StackSpacing } from "@/shared/constants/constants";
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

  return (
    <Stack spacing={StackSpacing.default}>
      <Stack
        direction="row"
        spacing={StackSpacing.tight}
        alignItems="center"
      >
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
