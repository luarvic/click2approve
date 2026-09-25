import type { SxProps, Theme } from "@mui/material";
export const Flex = {
  alignCenterSx: { alignItems: "center" } as const,
  alignStartSx: { alignItems: "flex-start" } as const,
  wrapSx: { flexWrap: "wrap" } as const,
  displaySx: { display: "flex" } as const,
  alignSelfStartSx: { alignSelf: "flex-start" } as const,
  inlineCenterSx: { display: "inline-flex", alignItems: "center" } as const,
  growSx: { flexGrow: 1 } as const,
  hiddenChildSx: {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
  } as SxProps<Theme>,
  minWidthZeroSx: { minWidth: 0 } as const,
  fullWidthOverflowHiddenSx: {
    width: "100%",
    overflow: "hidden",
  } as SxProps<Theme>,
} as const;
