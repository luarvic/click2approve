import { Box } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestTimelineContentProps {
  children: ReactNode;
}

const approvalRequestTimelineMinWidth = 600;

const timelineContentSx: SxProps<Theme> = {
  alignSelf: "flex-start",
  maxWidth: "100%",
  minWidth: { sm: approvalRequestTimelineMinWidth },
};

const ApprovalRequestTimelineContent: React.FC<
  ApprovalRequestTimelineContentProps
> = ({ children }) => <Box sx={timelineContentSx}>{children}</Box>;

export default ApprovalRequestTimelineContent;
