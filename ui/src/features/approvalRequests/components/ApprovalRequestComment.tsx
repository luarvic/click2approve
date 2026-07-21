import CommentPaper from "@/shared/components/papers/CommentPaper";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestCommentProps {
  label?: string;
  text?: string;
}

const approvalRequestCommentSx: SxProps<Theme> = {
  bgcolor: "action.hover",
  borderRadius: 1,
  px: 1.5,
  py: 1,
};

const ApprovalRequestComment: React.FC<ApprovalRequestCommentProps> = ({
  label,
  text,
}) => (
  <CommentPaper
    text={text}
    label={label}
    sx={approvalRequestCommentSx}
  />
);

export default ApprovalRequestComment;
