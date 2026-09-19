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
    minHeight: "100vh",
  } as SxProps<Theme>,
  contentBackgroundSx: {
    bgcolor: "background.default",
    minHeight: "100vh",
  } as SxProps<Theme>,
  mainContentSx: (drawerIsVisible: boolean): SxProps<Theme> => ({
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
  loadingProgressSx: {
    left: 0,
    position: "absolute",
    right: 0,
    top: appBarHeight,
    zIndex: 2,
  } as SxProps<Theme>,
  appBarSx: {
    bgcolor: "background.default",
    borderBottom: 1,
    borderColor: "divider",
    height: appBarHeight,
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
    height: appBarHeight,
    minHeight: appBarHeight,
  } as SxProps<Theme>,
  mainMenuButtonSx: (mainMenuDrawerIsOpen: boolean): SxProps<Theme> => ({
    mr: 1,
    display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
  }),
  appBarBrandContainerSx: {
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
    display: "block",
    color: "inherit",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
  mainMenuDrawerToolbarSx: {
    borderBottom: 1,
    borderColor: "divider",
    boxSizing: "border-box",
    height: appBarHeight,
    minHeight: appBarHeight,
    pl: 2,
    pr: 1,
  } as SxProps<Theme>,
  mainMenuDrawerFirstListSx: {
    pt: 1,
  } as SxProps<Theme>,
  mainMenuDrawerContentSx: {
    borderRight: 1,
    borderColor: "divider",
    minHeight: `calc(100vh - ${appBarHeight}px)`,
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
