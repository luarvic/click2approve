import type { SxProps, Theme } from "@mui/material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridCellProps {
  children: ReactNode;
}

const compactGridCellSx: SxProps<Theme> = {
  gap: { xs: 0.5, md: 0 },
  height: "100%",
  justifyContent: "center",
  minWidth: 0,
  py: { xs: 1.5, md: 0 },
  whiteSpace: "normal",
};

const CompactGridCell: React.FC<CompactGridCellProps> = ({ children }) => (
  <Stack sx={compactGridCellSx}>{children}</Stack>
);

export default CompactGridCell;
