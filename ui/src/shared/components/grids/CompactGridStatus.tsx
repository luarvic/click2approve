import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridStatusProps {
  children: ReactNode;
}

const CompactGridStatus: React.FC<CompactGridStatusProps> = ({ children }) => <Box>{children}</Box>;

export default CompactGridStatus;
