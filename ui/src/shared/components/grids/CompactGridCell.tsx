import type { SxProps, Theme } from "@mui/material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridCellProps {
  children: ReactNode;
  alwaysCompact?: boolean;
}

const compactGridCellSx: SxProps<Theme> = {
  gap: 0.5,
  height: "100%",
  justifyContent: "center",
  minWidth: 0,
  py: 1.5,
  whiteSpace: "normal",
};

const CompactGridCell: React.FC<CompactGridCellProps> = ({ children, alwaysCompact = false }) => (
  <Stack sx={[compactGridCellSx, !alwaysCompact && { gap: { md: 0 }, py: { md: 0 } }]}>{children}</Stack>
);

export default CompactGridCell;
