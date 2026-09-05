import type { SxProps, Theme } from "@mui/material";
export const AuthForms = {
  containerSx: {
    mt: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as SxProps<Theme>,
  maxWidth: "xs",
  authFormSx: { width: "100%" } as SxProps<Theme>,
  authActionsSx: { mt: 2 } as SxProps<Theme>,
  formSx: { mt: 1 } as SxProps<Theme>,
  inputVariant: "outlined",
} as const;
