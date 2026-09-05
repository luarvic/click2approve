import type { SxProps, Theme } from "@mui/material";

export const Forms = {
  sectionSx: { my: 1 } as SxProps<Theme>,
  bottomSpacingSx: { mb: 1 } as SxProps<Theme>,
  fieldHelperTextSx: { mx: 0 } as SxProps<Theme>,
  topSpacingSx: { pt: 1 } as SxProps<Theme>,
  textBottomSpacingSx: { mb: 2 } as SxProps<Theme>,
  contentStackSx: { mt: 1 } as SxProps<Theme>,
  tabContentSx: { mt: 3 } as SxProps<Theme>,
  addActionSx: { mt: 2 } as SxProps<Theme>,
  actionBarSx: { mt: 3 } as SxProps<Theme>,
  formStackSpacing: 2,
  actionSpacing: 1,
} as const;
