import type { SxProps, Theme } from "@mui/material";
const filterMultiSelectMinWidth = 180;
export const FilterStyles = {
  multiSelectMinWidth: filterMultiSelectMinWidth,
  multiSelectSx: { minWidth: filterMultiSelectMinWidth } as SxProps<Theme>,
} as const;
