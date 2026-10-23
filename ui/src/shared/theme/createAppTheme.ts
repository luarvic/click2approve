import { actionRowStyles } from "@/shared/components/buttons/actionRowStyles";
import { ControlTokens, SitePaletteTokens, SurfaceTokens } from "@/shared/theme/tokens";
import { PaletteMode, Theme, createTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    cardTitle: CSSProperties;
    sectionLabel: CSSProperties;
  }
  interface TypographyVariantsOptions {
    cardTitle?: CSSProperties;
    sectionLabel?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
    sectionLabel: true;
  }
}

const inputVariant = "standard";
const gridToolbarStyles = ({ theme }: { theme: Theme }) => ({
  ...actionRowStyles(theme),
  justifyContent: "flex-start",
  paddingTop: 0,
  paddingBottom: 12,
});
const structuralHeadingTypography = {
  letterSpacing: "1px",
  lineHeight: 1.5,
  textTransform: "uppercase",
} as const;

export const createAppTheme = (colorMode: PaletteMode) => {
  const colors = SitePaletteTokens[colorMode];
  const baseTheme = createTheme({
    palette: {
      mode: colorMode,
      primary: { main: colors.accent, contrastText: colorMode === "light" ? "#fff" : colors.background },
      background: { default: colors.background, paper: colors.background },
      text: { primary: colors.ink, secondary: colors.muted },
      action: { hover: colors.soft, selected: colors.soft },
    },
  });

  return createTheme({
    typography: {
      fontFamily: "Sora, sans-serif",
      fontSize: 14,
      h1: { fontSize: "2.25rem", fontWeight: 500, letterSpacing: "-0.075rem", lineHeight: 1.25 },
      h2: { fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.05rem", lineHeight: 1.35 },
      h3: { fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.0375rem", lineHeight: 1.4 },
      h4: { fontSize: "1.375rem", fontWeight: 500, letterSpacing: "-0.025rem", lineHeight: 1.4 },
      h5: { fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.05rem", lineHeight: 1.35 },
      h6: { fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.025rem", lineHeight: 1.5 },
      subtitle1: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.7 },
      subtitle2: { fontSize: "0.8125rem", fontWeight: 500, lineHeight: 1.7 },
      body1: { fontSize: "0.875rem", lineHeight: 1.75 },
      body2: { fontSize: "0.8125rem", lineHeight: 1.7 },
      button: { fontSize: "0.8125rem", fontWeight: 500, textTransform: "none", letterSpacing: "normal" },
      caption: { fontSize: "0.75rem", lineHeight: 1.7 },
      overline: { ...structuralHeadingTypography, fontSize: "0.625rem", fontWeight: 600 },
      cardTitle: { ...structuralHeadingTypography, fontSize: "0.75rem", fontWeight: 600 },
      sectionLabel: { ...structuralHeadingTypography, fontSize: "0.625rem", fontWeight: 500 },
    },
    palette: {
      ...baseTheme.palette,
      DataGrid: {
        bg: colors.background,
        headerBg: colors.background,
        pinnedBg: colors.background,
      },
    },
    components: {
      MuiAccordion: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            "&::before": { display: "none" },
          },
          rounded: {
            borderRadius: SurfaceTokens.borderRadius,
            "&:first-of-type, &:last-of-type": {
              borderRadius: SurfaceTokens.borderRadius,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: SurfaceTokens.borderRadius },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: ControlTokens.borderRadius,
            padding: "8px 16px",
          },
        },
      },
      MuiIconButton: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: ({ theme, ownerState }) => ({
            borderRadius: ControlTokens.borderRadius,
            flexShrink: 0,
            height: 32,
            padding: 0,
            width: 32,
            "& .MuiSvgIcon-root": { fontSize: 18 },
            ...(ownerState.color === "default" && {
              color: theme.palette.text.secondary,
              "&:hover": { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
            }),
            "&.Mui-focusVisible": {
              outline: "2px solid",
              outlineColor: theme.palette.primary.main,
              outlineOffset: 2,
              ...(ownerState.color === "default" && { color: theme.palette.primary.main }),
            },
            "@media (pointer: coarse)": { height: 44, width: 44 },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            alignSelf: "stretch",
            border: "1px solid",
            borderColor: theme.palette.divider,
            borderRadius: SurfaceTokens.borderRadius,
            backgroundImage: "none",
            boxShadow: "none",
            padding: 0,
          }),
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: ({ theme }) => actionRowStyles(theme),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => actionRowStyles(theme),
        },
      },
      MuiDataGrid: {
        defaultProps: { rowHeight: 60 },
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: theme.typography.body2.fontSize,
            "& .MuiDataGrid-columnHeaderTitle": {
              color: theme.palette.text.secondary,
              fontWeight: 500,
              letterSpacing: "0.5px",
            },
            "& .MuiDataGrid-columnSeparator": { color: theme.palette.divider },
            "& .MuiDataGrid-cell .MuiLink-root": {
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              "&:focus-visible": {
                textDecoration: "underline",
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            },
          }),
          toolbar: gridToolbarStyles,
          toolbarContainer: gridToolbarStyles,
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(2.5),
            "&:last-child": { paddingBottom: theme.spacing(2.5) },
            [theme.breakpoints.up("md")]: {
              padding: theme.spacing(3.5),
              "&:last-child": { paddingBottom: theme.spacing(3.5) },
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: SurfaceTokens.borderRadius,
            backgroundImage: "none",
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: "1.25rem", fontWeight: 500 } },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme, ownerState }) => {
            const color = ownerState.color ?? "default";
            const foreground = color === "default" ? theme.palette.text.secondary : theme.palette[color].main;
            return {
              backgroundColor: alpha(foreground, 0.08),
              borderColor: "transparent",
              color: foreground,
              fontSize: "0.75rem",
              fontWeight: 400,
              maxWidth: "100%",
            };
          },
        },
      },
      MuiTabs: {
        defaultProps: { variant: "scrollable", scrollButtons: "auto", allowScrollButtonsMobile: true },
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: 44,
            borderBottom: `1px solid ${theme.palette.divider}`,
            maxWidth: "100%",
          }),
          scrollButtons: { "&.Mui-disabled": { display: "none" } },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { minHeight: 44, minWidth: "auto", fontSize: "0.8125rem", fontWeight: 500, textTransform: "none" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
            fontSize: theme.typography.body1.fontSize,
            padding: theme.spacing(1.5, 2),
            [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1) },
          }),
          head: ({ theme }) => ({ color: theme.palette.text.secondary, fontWeight: 500 }),
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: ({ theme }) => ({
            "&::before": { borderBottomColor: theme.palette.divider },
          }),
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
          notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
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
};
