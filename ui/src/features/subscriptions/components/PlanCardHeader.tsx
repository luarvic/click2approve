import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface PlanCardHeaderProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
}

const headerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};
const titleRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 1,
};
const titleSx: SxProps<Theme> = {
  flex: "1 1 auto",
  width: "max-content",
  maxWidth: "100%",
  minWidth: 0,
  overflowWrap: "anywhere",
};
const statusSx: SxProps<Theme> = { display: "flex", flexShrink: 0 };

/** Keeps optional plan details compact, expanding naturally when text wraps. */
const PlanCardHeader = ({ title, subtitle, status }: PlanCardHeaderProps) => (
  <Box sx={headerSx}>
    <Box sx={titleRowSx}>
      <Typography variant="h6" sx={titleSx}>
        {title}
      </Typography>
      {status && <Box sx={statusSx}>{status}</Box>}
    </Box>
    {subtitle && (
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default PlanCardHeader;
