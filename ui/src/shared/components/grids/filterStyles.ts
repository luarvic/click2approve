import type { SxProps, Theme } from "@mui/material";
const filterMultiSelectMinWidth = 180;
export const FilterStyles = {
  containerSx: { mb: 2 } as const,
  multiSelectMinWidth: filterMultiSelectMinWidth,
  multiSelectSx: { minWidth: filterMultiSelectMinWidth } as SxProps<Theme>,
} as const;
