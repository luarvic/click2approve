import type { PopoverOrigin, SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import passwordValidator from "password-validator";
import type { CSSProperties } from "react";
export { Api, Discussions, Notifications, Refresh } from "@/shared/config/application";
export { Routes } from "@/shared/routing/routes";

const appBarHeight = 64;
const appBarBrandTitleWithoutTenantPickerHideBelowWidth = 400;
const appBarBrandTitleWithTenantPickerHideBelowWidth = 800;
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
  breadcrumbCurrentSx: {
    color: "text.primary",
    fontWeight: 600,
  } as SxProps<Theme>,
  breadcrumbLinkSx: {
    color: "text.secondary",
    textDecoration: "none",
    "&:hover": {
      color: "text.primary",
      textDecoration: "underline",
    },
  } as SxProps<Theme>,
  userProfileContainerSx: {
    display: "flex",
    flexDirection: "column",
  } as SxProps<Theme>,
  centeredMessageContainerSx: {
    mt: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as SxProps<Theme>,
  centeredMessageMaxWidth: "xs",
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
  inputVariant: "outlined",
  submitButtonSx: { mt: 2, mb: 2 } as SxProps<Theme>,
} as const;

export const Information = {
  emailVerificationTitle: "Verify your email address",
  emailVerificationMessage: "We have sent a verification link to your email address. Click the link to continue.",
  emailVerificationResultTitle: "Email address verification",
  emailVerificationSuccessMessage: "Your email address has been verified. {link} to continue.",
  emailVerificationFailureMessage: "Your email address verification failed. Try again or {link}.",
  passwordResetTitle: "Password reset",
  passwordResetMessage: "A reset password link was sent to your email address.",
} as const;

export const InputFields = {
  variant: "standard",
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

export const AssigneeTypeFieldMinWidth = 130;

export const Dialogs = {
  sectionSx: { my: 1 } as SxProps<Theme>,
  bottomSpacingSx: { mb: 1 } as SxProps<Theme>,
  fieldHelperTextSx: { mx: 0 } as SxProps<Theme>,
  topSpacingSx: { pt: 1 } as SxProps<Theme>,
  textBottomSpacingSx: { mb: 2 } as SxProps<Theme>,
  contentStackSx: { mt: 1 } as SxProps<Theme>,
  tabContentSx: { mt: 3 } as SxProps<Theme>,
  addStepButtonSx: { mt: 2 } as SxProps<Theme>,
  formStackSpacing: 2,
  stepStackSpacing: 2,
  stepHeaderSpacing: 1,
  stepHeaderSx: { mb: 1.5 } as SxProps<Theme>,
  stepTitleSx: { flexGrow: 1 } as SxProps<Theme>,
  stepActionSpacing: 0.5,
  assigneeStackSpacing: 1,
  assigneeTypeFieldSx: {
    minWidth: AssigneeTypeFieldMinWidth,
  } as SxProps<Theme>,
  removeAssigneeButtonSx: {
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
  approvalBoxSx: {
    bgcolor: "action.hover",
    borderRadius: 1,
    p: 2,
  } as SxProps<Theme>,
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
  none: 0,
  tight: 0.5,
  default: 1,
  relaxed: 1.5,
  loose: 2,
} as const;

export const Icons = {
  secondaryColor: "disabled",
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
  actionSubheaderSx: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    justifyContent: "flex-end",
    minHeight: appBarHeight,
    px: 1,
  } as SxProps<Theme>,
  mainMenuDrawerFirstListSx: {
    pt: 0,
  } as SxProps<Theme>,
  drawerPaperSx: {
    "& .MuiDrawer-paper": {
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

export const DataGrids = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 100],
  approvalNumberColumnWidth: 72,
  approvalNumberColumnMinDisplayWidth: 420,
  containerSx: Flex.fullWidthOverflowHiddenSx,
  sx: {
    border: "none",
    "--DataGrid-overlayHeight": "300px",
    "& .MuiDataGrid-cell": {
      alignItems: "center",
    },
    "& .MuiDataGrid-row": {
      cursor: "pointer",
    },
  } as SxProps<Theme>,
  approvalColumnFlex: {
    content: 5,
    metadata: 3,
  },
  approvalTitleCellSx: {
    height: "100%",
    justifyContent: "center",
    minWidth: 0,
  } as SxProps<Theme>,
  tenantUsersColumnSizing: {
    email: { flex: 3, minWidth: 220 },
    firstName: { flex: 2, minWidth: 130 },
    lastName: { flex: 2, minWidth: 130 },
    position: { flex: 2, minWidth: 150 },
    role: { flex: 1, minWidth: 110 },
    status: { flex: 1, minWidth: 150 },
  },
  teamsColumnSizing: {
    name: { flex: 3, minWidth: 220 },
    members: { flex: 5, minWidth: 260 },
  },
  delegationsColumnSizing: {
    employee: { flex: 3, minWidth: 220 },
    delegate: { flex: 3, minWidth: 220 },
  },
  tenantsColumnSizing: {
    businessName: { flex: 3, minWidth: 220 },
    currentEmployeeRole: { flex: 1, minWidth: 110 },
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
