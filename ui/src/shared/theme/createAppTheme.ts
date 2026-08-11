import { InputFields } from "@/shared/constants/constants";
import { PaletteMode, createTheme } from "@mui/material";

export const createAppTheme = (colorMode: PaletteMode) =>
  createTheme({
    typography: { fontFamily: "Sora, sans-serif" },
    palette: { mode: colorMode },
    components: {
      MuiFormControl: {
        defaultProps: { variant: InputFields.variant },
      },
      MuiTextField: {
        defaultProps: { variant: InputFields.variant },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            "&[type='password']": {
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
          },
        },
      },
      MuiTablePagination: {
        defaultProps: {
          SelectProps: { name: "rows-per-page" },
        },
      },
    },
  });
