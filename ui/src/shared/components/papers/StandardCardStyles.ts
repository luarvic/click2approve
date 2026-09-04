import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const standardCardSx: SxProps<Theme> = {
  alignSelf: "stretch",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: (theme) => `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}`,
  p: 0,
};

export const standardCardContentSx: SxProps<Theme> = {
  p: 2,
  "&:last-child": {
    pb: 2,
  },
};

export const elevatedStandardCardSx: SxProps<Theme> = {
  boxShadow: (theme) => `0 2px 6px ${alpha(theme.palette.common.black, 0.08)}`,
};
