import type { SxProps, Theme } from "@mui/material";
export const Text = {
  overflowEllipsisSx: { overflow: "hidden", textOverflow: "ellipsis" } as const,
  alignCenterSx: { textAlign: "center" } as SxProps<Theme>,
  alignRightSx: { textAlign: "right" } as SxProps<Theme>,
  ellipsisSx: {
    color: "inherit",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as SxProps<Theme>,
} as const;
