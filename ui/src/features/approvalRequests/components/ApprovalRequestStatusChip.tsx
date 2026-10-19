import { Box, type TypographyProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestStatusChipProps {
  color?: TypographyProps["color"];
  icon?: ReactNode;
  label: string;
}

const statusChipSx = (color: TypographyProps["color"] = "primary.main"): SxProps<Theme> => ({
  alignItems: "center",
  bgcolor:
    color === "primary.main" || color === "success.main"
      ? "action.hover"
      : "color-mix(in srgb, currentColor 10%, transparent)",
  borderRadius: "20px",
  color,
  display: "inline-flex",
  fontSize: "0.75rem",
  fontWeight: 400,
  gap: 0.75,
  lineHeight: 1.6,
  maxWidth: "100%",
  px: 1.5,
  py: 0.75,
  "& .MuiSvgIcon-root": { flexShrink: 0, fontSize: "0.875rem" },
  "@media print": { bgcolor: "rgba(0, 0, 0, 0.05)", color: "#162b20" },
});

const ApprovalRequestStatusChip: React.FC<ApprovalRequestStatusChipProps> = ({ color, icon, label }) => (
  <Box component="span" aria-label={`Status: ${label}`} sx={statusChipSx(color)}>
    {icon}
    {label}
  </Box>
);

export default ApprovalRequestStatusChip;
