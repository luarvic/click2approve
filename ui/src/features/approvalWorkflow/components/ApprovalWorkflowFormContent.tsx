import { Box } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalWorkflowFormContentProps {
  children: ReactNode;
}

const approvalWorkflowFormWidth = 600;

const formContentSx: SxProps<Theme> = {
  alignSelf: "flex-start",
  maxWidth: "100%",
  width: { sm: approvalWorkflowFormWidth },
};

/** Provides the consistent, narrow content area used by approval workflows. */
const ApprovalWorkflowFormContent: React.FC<ApprovalWorkflowFormContentProps> = ({
  children,
}) => <Box sx={formContentSx}>{children}</Box>;

export default ApprovalWorkflowFormContent;
