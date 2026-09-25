import { ControlTokens, SurfaceTokens } from "@/shared/theme/tokens";
import { PaletteMode, createTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

const inputVariant = "standard";

export const createAppTheme = (colorMode: PaletteMode) =>
  createTheme({
    typography: { fontFamily: "Sora, sans-serif" },
    palette: { mode: colorMode },
    components: {
      MuiAccordion: {
        styleOverrides: {
          rounded: {
            borderRadius: SurfaceTokens.borderRadius,
            "&:first-of-type, &:last-of-type": {
              borderRadius: SurfaceTokens.borderRadius,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: ControlTokens.borderRadius,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            alignSelf: "stretch",
            border: "1px solid",
            borderColor: theme.palette.divider,
            borderRadius: SurfaceTokens.borderRadius,
            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}`,
            padding: 0,
          }),
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          toolbar: { justifyContent: "flex-start" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: SurfaceTokens.borderRadius,
          },
        },
      },
      MuiFormControl: {
        defaultProps: { variant: inputVariant },
      },
      MuiTextField: {
        defaultProps: { variant: inputVariant },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: ControlTokens.borderRadius,
          },
          input: {
            "&[type='password']": {
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
          },
        },
      },
      MuiTablePagination: {
        defaultProps: {
          slotProps: {
            select: { name: "rows-per-page" },
          },
        },
      },
    },
  });
