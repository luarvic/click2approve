import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface StatusLineSectionProps {
  children: ReactNode;
  color: StatusLineColor;
  label: string;
  lineVariant?: "solid" | "dotted";
  sx?: SxProps<Theme>;
}

interface StatusLineLabelProps {
  color: StatusLineColor;
  label: string;
  lineVariant?: "solid" | "dotted";
}

const statusLineWidth = "3px";
const statusLineOffset = 1.5;

export const StatusLineColors = {
  canceled: "warning.main",
  completedSuccessfully: "success.main",
  completedUnsuccessfully: "error.main",
  other: "divider",
  started: "success.main",
} as const;

export type StatusLineColor = keyof typeof StatusLineColors;

const statusLineSectionSx = (
  color: StatusLineColor,
  lineVariant?: "solid" | "dotted",
): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${lineVariant ?? (color === "started" ? "dotted" : "solid")}`,
  borderLeftColor: StatusLineColors[color],
  minWidth: 0,
  pl: statusLineOffset,
});

const statusLineLabelSx = (
  color: StatusLineColor,
  lineVariant?: "solid" | "dotted",
): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${lineVariant ?? (color === "started" ? "dotted" : "solid")}`,
  borderLeftColor: StatusLineColors[color],
  height: "100%",
  justifyContent: "center",
  minWidth: 0,
  pl: statusLineOffset,
});

const statusBorderSx = (color: StatusLineColor): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${color === "started" ? "dotted" : "solid"}`,
  borderLeftColor: color === "other" ? "text.disabled" : StatusLineColors[color],
});

const getStatusLineSectionSx = (
  color: StatusLineColor,
  lineVariant?: "solid" | "dotted",
  sx?: SxProps<Theme>,
): SxProps<Theme> => sx
  ? ([statusLineSectionSx(color, lineVariant), sx] as SxProps<Theme>)
  : statusLineSectionSx(color, lineVariant);

export const getStatusBorderSx = (
  color: StatusLineColor,
  sx?: SxProps<Theme>,
): SxProps<Theme> => sx
  ? ([sx, statusBorderSx(color)] as SxProps<Theme>)
  : statusBorderSx(color);

export const StatusLineSection: React.FC<StatusLineSectionProps> = ({
  children,
  color,
  label,
  lineVariant,
  sx,
}) => (
  <Box
    aria-label={label}
    sx={getStatusLineSectionSx(color, lineVariant, sx)}
  >
    {children}
  </Box>
);

export const StatusLineLabel: React.FC<StatusLineLabelProps> = ({
  color,
  label,
  lineVariant,
}) => (
  <Stack
    sx={statusLineLabelSx(color, lineVariant)}
  >
    <Typography variant="body2">
      {label}
    </Typography>
  </Stack>
);
