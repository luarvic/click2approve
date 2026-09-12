import type { SxProps, Theme } from "@mui/material";
const appBarHeight = 72;
const appBarBrandTitleWithoutTenantPickerHideBelowWidth = 400;
const appBarBrandTitleWithTenantPickerHideBelowWidth = 800;
const mainMenuDrawerWidth = 240;
export const Shell = {
  appBarHeight,
  mainMenuDrawerWidth,
  outerBackgroundSx: {
    bgcolor: "action.hover",
    minHeight: "100vh",
  } as SxProps<Theme>,
  contentBackgroundSx: {
    bgcolor: "background.default",
    minHeight: "100vh",
  } as SxProps<Theme>,
  mainContentSx: (drawerIsVisible: boolean): SxProps<Theme> => ({
    ml: drawerIsVisible ? { md: `${mainMenuDrawerWidth}px` } : 0,
    minWidth: 0,
    position: "relative",
    transition: (theme) =>
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    width: {
      md: drawerIsVisible ? `calc(100% - ${mainMenuDrawerWidth}px)` : "100%",
    },
  }),
  loadingProgressSx: {
    left: 0,
    position: "absolute",
    right: 0,
    top: appBarHeight,
    zIndex: 2,
  } as SxProps<Theme>,
  appBarSx: (mainMenuDrawerIsVisible: boolean, profileDrawerIsOpen: boolean): SxProps<Theme> => ({
    bgcolor: "background.default",
    borderBottom: 1,
    borderColor: "divider",
    height: appBarHeight,
    ml: {
      md: (theme) =>
        mainMenuDrawerIsVisible
          ? `calc(max(0px, (100vw - ${theme.breakpoints.values.xl}px) / 2) + ${mainMenuDrawerWidth}px)`
          : `max(0px, calc((100vw - ${theme.breakpoints.values.xl}px) / 2))`,
    },
    width: {
      md: (theme) =>
        mainMenuDrawerIsVisible
          ? `min(calc(100% - ${mainMenuDrawerWidth}px), ${theme.breakpoints.values.xl - mainMenuDrawerWidth}px)`
          : `min(100%, ${theme.breakpoints.values.xl}px)`,
    },
    zIndex: (theme) => (profileDrawerIsOpen ? theme.zIndex.drawer - 1 : theme.zIndex.drawer + 1),
    transition: (theme) =>
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }),
  appBarToolbarSx: {
    height: appBarHeight,
    minHeight: appBarHeight,
    pl: 2,
    pr: 2,
  } as SxProps<Theme>,
  appBarSpacerSx: {
    height: appBarHeight,
    minHeight: appBarHeight,
  } as SxProps<Theme>,
  mainMenuButtonSx: (mainMenuDrawerIsOpen: boolean): SxProps<Theme> => ({
    mr: 1,
    display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
  }),
  appBarBrandContainerSx: (titleHideBelowWidth: number, collapseWhenTitleHidden: boolean): SxProps<Theme> => ({
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
    [`@media (max-width: ${titleHideBelowWidth}px)`]: collapseWhenTitleHidden ? { flex: "0 0 auto" } : undefined,
  }),
  appBarBrandTitleWithoutTenantPickerHideBelowWidth,
  appBarBrandTitleWithTenantPickerHideBelowWidth,
  appBarBrandLinkSx: {
    display: "flex",
    alignItems: "center",
    color: "inherit",
    maxWidth: "100%",
    minWidth: 0,
    textDecoration: "none",
    width: "fit-content",
  } as SxProps<Theme>,
  appBarLogoSx: {
    display: "block",
    flex: "0 0 36px",
    minHeight: 36,
    minWidth: 36,
    width: 36,
    height: 36,
    mr: 0.5,
  } as SxProps<Theme>,
  appBarBrandTitleSx: (hideBelowWidth: number): SxProps<Theme> => ({
    display: "block",
    ml: -0.5,
    [`@media (max-width: ${hideBelowWidth}px)`]: {
      display: "none",
    },
    color: "inherit",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  tenantPickerSx: {
    flex: "0 0 auto",
    maxWidth: 380,
    minWidth: 0,
    mr: 1,
    width: 380,
    [`@media (max-width: ${appBarBrandTitleWithTenantPickerHideBelowWidth}px)`]: {
      flex: "1 1 0",
      maxWidth: "none",
      width: "auto",
    },
    "& .MuiSelect-select": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
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
    height: 24,
    width: 24,
  } as SxProps<Theme>,
  mainMenuDrawerNavSx: (drawerIsOpen: boolean): SxProps<Theme> => ({
    width: {
      md: drawerIsOpen ? mainMenuDrawerWidth : 0,
    },
    flexShrink: { md: 0 },
    transition: (theme) =>
      theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }),
  mainMenuDrawerToolbarSx: {
    borderBottom: 1,
    borderColor: "divider",
    boxSizing: "border-box",
    height: appBarHeight,
    justifyContent: "flex-end",
    minHeight: appBarHeight,
    px: 1,
  } as SxProps<Theme>,
  mainMenuDrawerFirstListSx: {
    pt: 1,
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
      ...this.drawerPaperSx,
    };
  },
  get persistentDrawerSx(): SxProps<Theme> {
    return {
      display: { xs: "none", lg: "block" },
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        left: (theme) => `max(0px, calc((100vw - ${theme.breakpoints.values.xl}px) / 2))`,
        width: mainMenuDrawerWidth,
      },
    };
  },
  profileDrawerSx: {
    "& .MuiDrawer-paper": {
      right: (theme) => `max(0px, calc((100vw - ${theme.breakpoints.values.xl}px) / 2))`,
    },
  } as SxProps<Theme>,
  profileDrawerContentSx: { minWidth: 280 } as SxProps<Theme>,
} as const;
