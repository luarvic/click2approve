import type { SxProps, Theme } from "@mui/material";
export const Text = {
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
