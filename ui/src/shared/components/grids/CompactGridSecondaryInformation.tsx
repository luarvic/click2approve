import type { SxProps, Theme } from "@mui/material";
import { Typography } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridSecondaryInformationProps {
  children: ReactNode;
}

const compactGridSecondaryInformationSx: SxProps<Theme> = { overflowWrap: "anywhere", whiteSpace: "normal" };

const CompactGridSecondaryInformation: React.FC<CompactGridSecondaryInformationProps> = ({ children }) => (
  <Typography color="text.secondary" sx={compactGridSecondaryInformationSx} variant="body2">
    {children}
  </Typography>
);

export default CompactGridSecondaryInformation;
