import type { SxProps, Theme } from "@mui/material";
export const Flex = {
  growSx: { flexGrow: 1 } as SxProps<Theme>,
  hiddenChildSx: {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
  } as SxProps<Theme>,
  minWidthZeroSx: { minWidth: 0 } as SxProps<Theme>,
  fullWidthOverflowHiddenSx: {
    width: "100%",
    overflow: "hidden",
  } as SxProps<Theme>,
} as const;
