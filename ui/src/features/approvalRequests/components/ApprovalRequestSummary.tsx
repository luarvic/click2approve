import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import { UserFile } from "@/features/userFiles/models/userFile";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestSummaryProps {
  approvalRequestId?: number;
  approvalRequestTaskId?: number;
  description?: string;
  title: string;
  userFiles?: UserFile[];
}

const summaryTitleSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
};

const summaryDescriptionSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
};

const ApprovalRequestSummary: React.FC<ApprovalRequestSummaryProps> = ({
  approvalRequestId,
  approvalRequestTaskId,
  description,
  title,
  userFiles,
}) => {
  const trimmedDescription = description?.trim();

  return (
    <Stack spacing={StackSpacing.tight}>
      <Typography
        component="h2"
        variant="h6"
        sx={summaryTitleSx}
      >
        {title}
      </Typography>
      {trimmedDescription && (
        <Typography
          variant="body1"
          sx={summaryDescriptionSx}
        >
          {trimmedDescription}
        </Typography>
      )}
      <ApprovalRequestFilesBox
        userFiles={userFiles}
        approvalRequestId={approvalRequestId}
        approvalRequestTaskId={approvalRequestTaskId}
      />
    </Stack>
  );
};

export default ApprovalRequestSummary;
