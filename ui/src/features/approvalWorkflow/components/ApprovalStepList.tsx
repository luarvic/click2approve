import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepListProps {
  children: ReactNode;
}

const stepSpacing = 4;
const stepListSx = { listStyle: "none", m: 0, p: 0 } as const;

const ApprovalStepList: React.FC<ApprovalStepListProps> = ({ children }) => (
  <Stack component="ol" role="list" spacing={stepSpacing} sx={stepListSx}>
    {children}
  </Stack>
);

export default ApprovalStepList;
