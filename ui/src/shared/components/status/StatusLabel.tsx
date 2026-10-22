import { StatusLineColors, type StatusLineColor } from "@/shared/components/status/StatusLines";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface StatusLabelProps {
  color: StatusLineColor;
  label: string;
}

const labelSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  height: "100%",
  minWidth: 0,
};

const bulletSx = (color: StatusLineColor): SxProps<Theme> => ({
  bgcolor: StatusLineColors[color],
  borderRadius: "50%",
  flexShrink: 0,
  height: "8px",
  width: "8px",
});

/** Displays a grid status with a colored bullet and a readable label. */
const StatusLabel = ({ color, label }: StatusLabelProps) => (
  <Box sx={labelSx}>
    <Box component="span" aria-hidden="true" sx={bulletSx(color)} />
    <Typography variant="body2">{label}</Typography>
  </Box>
);

export default StatusLabel;
