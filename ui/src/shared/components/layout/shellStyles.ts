import { ControlTokens } from "@/shared/theme/tokens";
import { alpha } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
const appBarHeight = 72;
const appBarLogoSize = 42;
const mainMenuLogoSize = 36;
const mainMenuDrawerWidth = 240;
export const Shell = {
  appBarHeight,
  mainMenuDrawerWidth,
  outerBackgroundSx: {
    bgcolor: "background.default",
    minHeight: "100dvh",
  } as SxProps<Theme>,
  contentBackgroundSx: {
    bgcolor: "background.default",
  } as SxProps<Theme>,
  mainContentSx: (drawerIsVisible: boolean): SxProps<Theme> => ({
    display: "flex",
    flexDirection: "column",
    minHeight: { xs: `calc(100dvh - ${appBarHeight}px)`, lg: "100dvh" },
    ml: drawerIsVisible ? { lg: `${mainMenuDrawerWidth}px` } : 0,
    minWidth: 0,
    position: "relative",
    transition: (theme) =>
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    width: {
      lg: drawerIsVisible ? `calc(100% - ${mainMenuDrawerWidth}px)` : "100%",
    },
  }),
  pageBodySx: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 } as SxProps<Theme>,
  loadingProgressSx: {
    left: 0,
    position: "absolute",
    right: 0,
    top: { xs: 0, lg: appBarHeight },
    zIndex: 2,
  } as SxProps<Theme>,
  appBarSx: {
    bgcolor: "background.default",
    borderBottom: 1,
    borderColor: "divider",
    height: appBarHeight,
    // Keep the mobile header's space in the page flow as browser toolbars collapse.
    position: { xs: "sticky", lg: "fixed" },
    top: 0,
    width: "100%",
    zIndex: (theme) => theme.zIndex.drawer + 1,
  } as SxProps<Theme>,
  appBarToolbarSx: {
    flexShrink: 0,
    height: "100%",
    minHeight: "100%",
    px: 2,
  } as SxProps<Theme>,
  appBarSpacerSx: {
    display: { xs: "none", lg: "flex" },
    flexShrink: 0,
    height: appBarHeight,
    minHeight: appBarHeight,
  } as SxProps<Theme>,
  mainMenuButtonSx: (mainMenuDrawerIsOpen: boolean): SxProps<Theme> => ({
    borderRadius: "50%",
    height: 40,
    padding: 1,
    width: 40,
    "& .MuiSvgIcon-root": { fontSize: 24 },
    "@media (pointer: coarse)": { height: 44, width: 44 },
    mr: 1,
    display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
  }),
  appBarBrandContainerSx: {
    alignItems: "center",
    alignSelf: "stretch",
    display: "flex",
    flex: "1 0 auto",
    justifyContent: "flex-start",
    minWidth: 0,
    overflow: "hidden",
    pr: 1,
  } as SxProps<Theme>,
  appBarBrandLinkSx: {
    display: "flex",
    gap: 1,
    alignItems: "center",
    color: "inherit",
    maxWidth: "100%",
    minWidth: 0,
    textDecoration: "none",
    width: "fit-content",
  } as SxProps<Theme>,
  get mainMenuBrandLinkSx(): SxProps<Theme> {
    return {
      ...this.appBarBrandLinkSx,
      gap: 0.3,
    };
  },
  appBarLogoSx: {
    display: "block",
    flex: "0 0 auto",
    minHeight: appBarLogoSize,
    width: "auto",
    height: appBarLogoSize,
  } as SxProps<Theme>,
  mainMenuLogoSx: {
    display: "block",
    flex: "0 0 auto",
    minHeight: mainMenuLogoSize,
    width: "auto",
    height: mainMenuLogoSize,
  } as SxProps<Theme>,
  appBarBrandTitleSx: {
    lineHeight: "32px",
    alignItems: "center",
    display: "flex",
    minHeight: "32px",
    color: "inherit",
    fontSize: "19px",
    fontWeight: 600,
    letterSpacing: "normal",
    position: "relative",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    "@media (max-width: 700px)": {
      fontSize: "18px",
    },
  } as SxProps<Theme>,
  appBarBrandBadgeSx: {
    display: "inline-flex",
    lineHeight: 1,
    position: "relative",
    verticalAlign: "middle",
  } as SxProps<Theme>,
  appBarBrandChipSx: {
    bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
    borderRadius: "4px",
    color: "text.secondary",
    fontSize: "9px",
    fontWeight: 400,
    height: 16,
    position: "absolute",
    right: 0,
    top: "2px",
    transform: "translate(calc(100% - 2px), -100%)",
    "& .MuiChip-label": { px: "5px" },
  } as SxProps<Theme>,
  tenantPickerSx: {
    flex: "0 1 auto",
    maxWidth: 380,
    minWidth: 0,
    mr: 1,
    width: 380,
    "& .MuiSelect-select": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  } as SxProps<Theme>,
  profileButtonSx: {
    borderRadius: "50%",
    height: 48,
    padding: 1,
    width: 48,
    "@media (pointer: coarse)": { height: 48, width: 48 },
  } as SxProps<Theme>,
  profileAvatarSx: {
    bgcolor: "action.active",
    color: "background.paper",
    fontSize: "0.875rem",
    fontWeight: 600,
    height: 32,
    width: 32,
  } as SxProps<Theme>,
  profileDrawerAvatarSx: {
    bgcolor: "action.active",
    color: "background.paper",
    height: 24,
    width: 24,
  } as SxProps<Theme>,
  profileDrawerBackdropSx: {
    zIndex: (theme) => theme.zIndex.drawer + 4,
  } as SxProps<Theme>,
  profileDrawerModalSx: {
    pointerEvents: "none",
    zIndex: (theme) => theme.zIndex.drawer + 5,
  } as SxProps<Theme>,
  profileDrawerPaperSx: {
    pointerEvents: "auto",
  } as SxProps<Theme>,
  profileDrawerToolbarSx: {
    borderBottom: 1,
    borderColor: "divider",
    boxSizing: "border-box",
    height: appBarHeight,
    justifyContent: "space-between",
    minHeight: appBarHeight,
    pl: 2,
    pr: 1,
  } as SxProps<Theme>,
  mainMenuDrawerNavSx: (drawerIsOpen: boolean): SxProps<Theme> => ({
    width: {
      lg: drawerIsOpen ? mainMenuDrawerWidth : 0,
    },
    flexShrink: { lg: 0 },
    transition: (theme) =>
      theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }),
  mainMenuDrawerContainerSx: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
  } as SxProps<Theme>,
  mainMenuDrawerToolbarSx: {
    borderBottom: 1,
    borderColor: "divider",
    boxSizing: "border-box",
    height: appBarHeight,
    minHeight: appBarHeight,
    flexShrink: 0,
    pl: 2,
    pr: 1,
  } as SxProps<Theme>,
  mainMenuDrawerContentSx: {
    borderRight: 1,
    borderColor: "divider",
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    px: 1.5,
    py: 3,
    "& > .MuiList-root": {
      pt: 0,
      pb: 2.5,
    },
    "& > .MuiList-root:first-child > .MuiListSubheader-root": {
      mt: 0,
    },
    "& .MuiListItemButton-root": {
      borderRadius: ControlTokens.borderRadius,
      color: "text.secondary",
      minHeight: { xs: 44, lg: 40 },
      px: 1.5,
      py: 1,
    },
    "& .MuiListItemText-primary": {
      fontSize: "0.8125rem",
      lineHeight: 1.6,
    },
    "& .MuiListItemIcon-root": {
      color: "inherit",
      minWidth: 30,
      "& .MuiSvgIcon-root": { fontSize: "20px" },
    },
    "& .MuiListItemButton-root.Mui-selected": {
      bgcolor: "action.selected",
      color: "primary.main",
      "& .MuiListItemText-primary": { fontWeight: 500 },
      "&:hover": { bgcolor: "action.hover" },
    },
    "& .MuiListSubheader-root": {
      alignItems: "center",
      bgcolor: "transparent",
      color: "text.secondary",
      display: "flex",
      typography: "overline",
      lineHeight: "20px",
      minHeight: 32,
      mt: 1,
      position: "static",
      px: 1.5,
      py: 0.75,
    },
  } as SxProps<Theme>,
  drawerPaperSx: {
    "& .MuiDrawer-paper": {
      backgroundImage: "none",
      boxSizing: "border-box",
      width: mainMenuDrawerWidth,
    },
  } as SxProps<Theme>,
  get temporaryDrawerSx(): SxProps<Theme> {
    return {
      display: { xs: "block", lg: "none" },
      zIndex: (theme) => theme.zIndex.drawer + 3,
      ...this.drawerPaperSx,
    };
  },
  get persistentDrawerSx(): SxProps<Theme> {
    return {
      display: { xs: "none", lg: "block" },
      "& .MuiDrawer-paper": {
        borderRight: 0,
        boxSizing: "border-box",
        left: 0,
        width: mainMenuDrawerWidth,
        zIndex: (theme) => theme.zIndex.drawer + 2,
      },
    };
  },
  profileDrawerContentSx: { minWidth: 280 } as SxProps<Theme>,
} as const;
