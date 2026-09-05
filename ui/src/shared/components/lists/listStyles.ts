import type { SxProps, Theme } from "@mui/material";
export const Lists = {
  overflowHiddenSx: {
    overflow: "hidden",
  } as SxProps<Theme>,
  itemSpacing: 1,
  itemIconSx: { minWidth: 35 } as SxProps<Theme>,
  actionSubheaderSx: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as SxProps<Theme>,
} as const;
