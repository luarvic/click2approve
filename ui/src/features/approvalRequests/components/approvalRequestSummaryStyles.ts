import type { SxProps, Theme } from "@mui/material";

// Match the landing page's open card spacing without changing editor cards.
export const summaryCardContentSx: SxProps<Theme> = {
  p: { xs: 2.5, md: 3.5 },
  "&:last-child": { pb: { xs: 2.5, md: 3.5 } },
};
