import { actionRowStyles } from "@/shared/components/buttons/actionRowStyles";
import type { SxProps, Theme } from "@mui/material";

const horizontalActionSpacing = (theme: Theme) => ({
  [theme.breakpoints.up("sm")]: actionRowStyles(theme),
});

export const Forms = {
  sectionSx: { my: 1 } as SxProps<Theme>,
  bottomSpacingSx: { mb: 1 } as SxProps<Theme>,
  fieldHelperTextSx: { mx: 0 } as SxProps<Theme>,
  topSpacingSx: { pt: 1 } as SxProps<Theme>,
  textBottomSpacingSx: { mb: 2 } as SxProps<Theme>,
  tabContentSx: { mt: 3 } as SxProps<Theme>,
  addActionSx: ((theme) => ({ mt: 2, ...horizontalActionSpacing(theme) })) as SxProps<Theme>,
  actionBarSx: ((theme) => ({ mt: 3, ...horizontalActionSpacing(theme) })) as SxProps<Theme>,
  cardStackSpacing: 4,
  formStackSpacing: 2,
  actionSpacing: 1,
} as const;
