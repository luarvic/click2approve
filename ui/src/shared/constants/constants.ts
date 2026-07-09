import type { PopoverOrigin, SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import passwordValidator from "password-validator";
import type { CSSProperties } from "react";

const uncompletedTasksRefreshSecondsDefault = 30;
const uncompletedTasksRefreshSeconds = Number(
  import.meta.env.VITE_UNCOMPLETED_TASKS_REFRESH_SECONDS ??
  String(uncompletedTasksRefreshSecondsDefault),
);
const appBarHeight = 64;
const mainMenuDrawerWidth = 240;
const passwordMinLength = 8;
const passwordValidatorInstance = new passwordValidator();

passwordValidatorInstance
  .is()
  .min(passwordMinLength)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols();

export const Api = {
  baseUri: import.meta.env.VITE_API_BASE_URI,
  uiBaseUri: import.meta.env.VITE_UI_BASE_URI,
  timeoutMs: 10000,
  emailServiceIsEnabled:
    import.meta.env.VITE_EMAIL_SERVICE_IS_ENABLED === "true",
} as const;

export const Tasks = {
  uncompletedRefreshSeconds:
    Number.isFinite(uncompletedTasksRefreshSeconds) &&
      uncompletedTasksRefreshSeconds > 0
      ? uncompletedTasksRefreshSeconds
      : uncompletedTasksRefreshSecondsDefault,
  get uncompletedRefreshMs() {
    return this.uncompletedRefreshSeconds * 1000;
  },
} as const;

export const Toasts = {
  autoClose: 3000,
  limit: 2,
  closeButton: true,
  draggable: false,
} as const;

export const GridToolbar = {
  buttonDisplay: {
    xs: "none",
    md: "flex",
  },
  maxSizeWhenDisplay: "md",
  get buttonSlotProps() {
    return {
      button: { sx: { display: this.buttonDisplay } },
    };
  },
} as const;

export const Pages = {
  containerSx: { p: 2 } as SxProps<Theme>,
  titleSx: { mb: 2 } as SxProps<Theme>,
  tenantWelcomeContainerSx: {
    p: 3,
    maxWidth: 560,
  } as SxProps<Theme>,
  userSettingsContainerSx: {
    display: "flex",
    flexDirection: "column",
  } as SxProps<Theme>,
  backdropLoadingSx: {
    color: "#fff",
    zIndex: (theme) => theme.zIndex.modal + 1,
  } as SxProps<Theme>,
} as const;

export const AuthForms = {
  containerSx: {
    mt: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as SxProps<Theme>,
  maxWidth: "xs",
  formSx: { mt: 1 } as SxProps<Theme>,
  submitButtonSx: { mt: 2, mb: 2 } as SxProps<Theme>,
} as const;

export const Text = {
  alignCenterSx: { textAlign: "center" } as SxProps<Theme>,
  alignRightSx: { textAlign: "right" } as SxProps<Theme>,
  ellipsisSx: {
    color: "inherit",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as SxProps<Theme>,
} as const;

export const Dialogs = {
  sectionSx: { my: 1 } as SxProps<Theme>,
  bottomSpacingSx: { mb: 1 } as SxProps<Theme>,
  fieldHelperTextSx: { mx: 0 } as SxProps<Theme>,
  topSpacingSx: { pt: 1 } as SxProps<Theme>,
  textBottomSpacingSx: { mb: 2 } as SxProps<Theme>,
  contentStackSx: { mt: 1 } as SxProps<Theme>,
  addStepButtonSx: { mt: 2 } as SxProps<Theme>,
  formStackSpacing: 2,
  stepStackSpacing: 2,
  stepHeaderSpacing: 1,
  stepHeaderSx: { mb: 1.5 } as SxProps<Theme>,
  stepTitleSx: { flexGrow: 1 } as SxProps<Theme>,
  stepActionSpacing: 0.5,
  approverStackSpacing: 1,
  approverTypeFieldSx: { minWidth: 130 } as SxProps<Theme>,
  removeApproverButtonSx: {
    alignSelf: { xs: "flex-end", sm: "center" },
    height: 40,
    width: 40,
  } as SxProps<Theme>,
  approvalStepSx: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    p: 2,
  } as SxProps<Theme>,
  commentTextFieldRows: 4,
  tenantMaxWidth: "sm",
} as const;

export const Files = {
  inputStyle: { display: "none" } as CSSProperties,
} as const;

export const Accordions = {
  detailsSx: { my: 2 } as SxProps<Theme>,
  detailsContentSx: { pt: 0, pb: 2 } as SxProps<Theme>,
} as const;

export const Flex = {
  growSx: { flexGrow: 1 } as SxProps<Theme>,
  hiddenChildSx: {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
  } as SxProps<Theme>,
  minWidthZeroSx: { minWidth: 0 } as SxProps<Theme>,
  fullWidthOverflowHiddenSx: {
    width: "100%",
    overflow: "hidden",
  } as SxProps<Theme>,
} as const;

export const StackSpacing = {
  tight: 0.5,
  default: 1,
  relaxed: 1.5,
  loose: 2,
} as const;

export const Icons = {
  verticalAlignSx: {
    verticalAlign: "middle",
  } as SxProps<Theme>,
  svgNoShrinkStyle: { flexShrink: 0 } as CSSProperties,
} as const;

export const Lists = {
  overflowHiddenSx: {
    overflow: "hidden",
  } as SxProps<Theme>,
  itemSpacing: 1,
  itemIconSx: { minWidth: 35 } as SxProps<Theme>,
  sectionHeaderSx: {
    bgcolor: "transparent",
    color: "text.secondary",
    fontWeight: 600,
    lineHeight: 1,
    px: 2,
    pt: 2,
    pb: 1,
  } as SxProps<Theme>,
} as const;

export const NoRowsOverlay = {
  svgWidth: 240,
  svgHeight: 200,
  colors: {
    image1: {
      light: "#aeb8c2",
      dark: "#262626",
    },
    image2: {
      light: "#f5f5f7",
      dark: "#595959",
    },
    image3: {
      light: "#dce0e6",
      dark: "#434343",
    },
    image4: {
      light: "#fff",
      dark: "#1c1c1c",
    },
    image5: {
      light: "#f5f5f5",
      dark: "#fff",
    },
    image5FillOpacity: {
      light: "0.8",
      dark: "0.08",
    },
  },
} as const;

export const Comments = {
  paperSx: { p: 1, mb: 1 } as SxProps<Theme>,
  textSx: { fontStyle: "italic" } as SxProps<Theme>,
} as const;

export const Shell = {
  appBarHeight,
  mainMenuDrawerWidth,
  mainContentSx: (drawerIsVisible: boolean): SxProps<Theme> => ({
    ml: drawerIsVisible ? { md: `${mainMenuDrawerWidth}px` } : 0,
    transition: (theme) =>
      theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }),
  appBarSx: (
    mainMenuDrawerIsVisible: boolean,
    profileDrawerIsOpen: boolean,
  ): SxProps<Theme> => ({
    bgcolor: "background.default",
    borderBottom: 1,
    borderColor: "divider",
    ml: {
      md: mainMenuDrawerIsVisible ? `${mainMenuDrawerWidth}px` : 0,
    },
    width: {
      md: mainMenuDrawerIsVisible
        ? `calc(100% - ${mainMenuDrawerWidth}px)`
        : "100%",
    },
    zIndex: (theme) =>
      profileDrawerIsOpen ? theme.zIndex.drawer - 1 : theme.zIndex.drawer + 1,
    transition: (theme) =>
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }),
  appBarToolbarSx: {
    minHeight: appBarHeight,
    pl: 2,
    pr: 2,
  } as SxProps<Theme>,
  appBarSpacerSx: {
    minHeight: appBarHeight,
  } as SxProps<Theme>,
  mainMenuButtonSx: (mainMenuDrawerIsOpen: boolean): SxProps<Theme> => ({
    mr: 1,
    display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
  }),
  appBarBrandContainerSx: {
    flex: { xs: "0 0 auto", sm: "1 1 auto" },
    minWidth: 0,
    overflow: "hidden",
  } as SxProps<Theme>,
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
    flexShrink: 0,
    width: 36,
    height: 36,
    mr: 0.5,
  } as SxProps<Theme>,
  appBarBrandTitleSx: {
    display: { xs: "none", sm: "block" },
    color: "inherit",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as SxProps<Theme>,
  tenantPickerSx: {
    flex: { xs: "1 1 auto", sm: "0 1 auto" },
    maxWidth: { xs: "none", sm: 220 },
    minWidth: 0,
    mr: 1,
    width: { xs: "auto", sm: 220 },
    "& .MuiSelect-select": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  } as SxProps<Theme>,
  notificationPopoverTextSx: {
    p: 2,
    maxWidth: 280,
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
    justifyContent: "flex-end",
    minHeight: appBarHeight,
    px: 1,
  } as SxProps<Theme>,
  drawerPaperSx: {
    "& .MuiDrawer-paper": {
      boxSizing: "border-box",
      width: mainMenuDrawerWidth,
    },
  } as SxProps<Theme>,
  get temporaryDrawerSx(): SxProps<Theme> {
    return {
      display: { xs: "block", md: "none" },
      ...this.drawerPaperSx,
    };
  },
  get persistentDrawerSx(): SxProps<Theme> {
    return {
      display: { xs: "none", md: "block" },
      ...this.drawerPaperSx,
    };
  },
  drawerComposeActionContainerSx: {
    px: 2,
  } as SxProps<Theme>,
  drawerComposeButtonSx: {
    justifyContent: "center",
    border: 1,
    borderColor: "primary.main",
    borderRadius: 1,
    my: 1,
    bgcolor: "transparent",
    px: 2,
    py: 1.25,
    "&:hover": {
      border: 1,
      borderColor: "primary.main",
      bgcolor: "transparent",
    },
  } as SxProps<Theme>,
  profileDrawerContentSx: { minWidth: 280 } as SxProps<Theme>,
} as const;

export const DataGrids = {
  defaultPageSize: 10,
  containerSx: Flex.fullWidthOverflowHiddenSx,
  sx: {
    border: "none",
    "--DataGrid-overlayHeight": "300px",
    "& .MuiDataGrid-cell": {
      alignItems: "center",
    },
  } as SxProps<Theme>,
  approvalColumnFlex: {
    content: 5,
    metadata: 3,
    action: 2,
  },
  tenantUsersColumnSizing: {
    email: { flex: 3, minWidth: 220 },
    firstName: { flex: 2, minWidth: 130 },
    lastName: { flex: 2, minWidth: 130 },
    position: { flex: 2, minWidth: 150 },
    role: { flex: 1, minWidth: 110 },
    status: { flex: 1, minWidth: 120 },
    action: { flex: 1, minWidth: 90 },
  },
  teamsColumnSizing: {
    name: { flex: 3, minWidth: 220 },
    members: { flex: 5, minWidth: 260 },
    action: { flex: 1, minWidth: 90 },
  },
  tenantsColumnSizing: {
    businessName: { flex: 3, minWidth: 220 },
    email: { flex: 2, minWidth: 180 },
    phone: { flex: 2, minWidth: 140 },
    websiteUrl: { flex: 2, minWidth: 180 },
    role: { flex: 1, minWidth: 110 },
    isOwner: { flex: 1, minWidth: 110 },
    action: { flex: 1, minWidth: 90 },
  },
} as const;

export const Menus = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "right",
  } as PopoverOrigin,
  transformOrigin: {
    horizontal: 40,
    vertical: "top",
  } as PopoverOrigin,
  notificationPopoverAnchorOrigin: {
    vertical: "bottom",
    horizontal: "right",
  } as PopoverOrigin,
  notificationPopoverTransformOrigin: {
    vertical: "top",
    horizontal: "right",
  } as PopoverOrigin,
} as const;

export const Validation = {
  passwordMinLength,
  emailRegex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i,
  passwordValidator: passwordValidatorInstance,
  passwordValidatorError: `Password must be min ${passwordMinLength} chars,
  have at least one lower case letter,
  one uppercase letter,
  one digit,
  and one symbol`,
} as const;

export const AccountSecurity = {
  maxFailedAttemptsToSignIn: 3,
  lockOutTimeInMinutes: 5,
} as const;

export const Errors = {
  unknownMessage: "Unknown error occurred.",
} as const;

export const Routes = {
  defaultPath: "/inbox",
} as const;
