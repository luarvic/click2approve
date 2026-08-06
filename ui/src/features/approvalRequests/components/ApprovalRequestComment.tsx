import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestCommentProps {
  text?: string;
}

const commentTextSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
};

const ApprovalRequestComment: React.FC<ApprovalRequestCommentProps> = ({ text }) => {
  const trimmedText = text?.trim();

  return trimmedText && (
    <Typography sx={commentTextSx} variant="body1">
      {trimmedText}
    </Typography>
  );
};

export default ApprovalRequestComment;
