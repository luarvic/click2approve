import type { SxProps, Theme } from "@mui/material";

export const summaryCardContentPadding = { xs: 2.5, md: 3.5 } as const;

// Match the landing page's open card spacing without changing editor cards.
export const summaryCardContentSx: SxProps<Theme> = {
  p: summaryCardContentPadding,
  "&:last-child": { pb: summaryCardContentPadding },
};
