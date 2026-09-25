import type { SxProps, Theme } from "@mui/material";
import { Typography } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridSecondaryInformationProps {
  children: ReactNode;
}

const compactGridSecondaryInformationSx: SxProps<Theme> = { overflowWrap: "anywhere", whiteSpace: "normal" };

const CompactGridSecondaryInformation: React.FC<CompactGridSecondaryInformationProps> = ({ children }) => (
  <Typography variant="body2" color="text.secondary" sx={compactGridSecondaryInformationSx}>
    {children}
  </Typography>
);

export default CompactGridSecondaryInformation;
