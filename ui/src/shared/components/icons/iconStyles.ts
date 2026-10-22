import type { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";
export const Icons = {
  secondaryColor: "disabled",
  verticalAlignSx: {
    verticalAlign: "middle",
  } as SxProps<Theme>,
  svgNoShrinkStyle: { flexShrink: 0 } as CSSProperties,
} as const;
