import type { PopoverOrigin, SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import passwordValidator from "password-validator";

// API
export const API_BASE_URI = import.meta.env.VITE_API_BASE_URI;
export const UI_BASE_URI = import.meta.env.VITE_UI_BASE_URI;
export const API_TIMEOUT_MS = 10000;
export const EMAIL_SERVICE_IS_ENABLED: boolean =
  import.meta.env.VITE_EMAIL_SERVICE_IS_ENABLED === "true";
const UNCOMPLETED_TASKS_REFRESH_SECONDS_DEFAULT = 30;
const uncompletedTasksRefreshSeconds = Number(
  import.meta.env.VITE_UNCOMPLETED_TASKS_REFRESH_SECONDS ??
  String(UNCOMPLETED_TASKS_REFRESH_SECONDS_DEFAULT)
);
export const UNCOMPLETED_TASKS_REFRESH_SECONDS =
  Number.isFinite(uncompletedTasksRefreshSeconds) &&
    uncompletedTasksRefreshSeconds > 0
    ? uncompletedTasksRefreshSeconds
    : UNCOMPLETED_TASKS_REFRESH_SECONDS_DEFAULT;
export const UNCOMPLETED_TASKS_REFRESH_MS =
  UNCOMPLETED_TASKS_REFRESH_SECONDS * 1000;

// Toast
export const TOAST_AUTO_CLOSE = 3000;
export const TOAST_LIMIT = 2;
export const TOAST_CLOSE_BUTTON = true;
export const TOAST_DRAGGABLE = false;
export const DATA_GRID_DEFAULT_PAGE_SIZE = 10;

// Visibility
export const MAX_SIZE_WHEN_DISPLAY = "md";
export const DISPLAY_DEPENDING_ON_SIZE = {
  xs: "none",
  md: "flex",
};

// Grids
export const GRID_TOOLBAR_BUTTON_SLOT_PROPS = {
  button: { sx: { display: DISPLAY_DEPENDING_ON_SIZE } },
};

// Layout
export const PAGE_CONTAINER_SX: SxProps<Theme> = { p: 2 };
export const PAGE_TITLE_SX: SxProps<Theme> = { mb: 2 };
export const AUTH_FORM_CONTAINER_SX: SxProps<Theme> = {
  mt: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
export const AUTH_CONTAINER_MAX_WIDTH = "xs";
export const AUTH_FORM_SX: SxProps<Theme> = { mt: 1 };
export const FORM_SUBMIT_BUTTON_SX: SxProps<Theme> = { mt: 2, mb: 2 };
export const TEXT_ALIGN_CENTER_SX: SxProps<Theme> = { textAlign: "center" };
export const TEXT_ALIGN_RIGHT_SX: SxProps<Theme> = { textAlign: "right" };
export const FULL_WIDTH_OVERFLOW_HIDDEN_SX: SxProps<Theme> = {
  width: "100%",
  overflow: "hidden",
};
export const DIALOG_SECTION_SX: SxProps<Theme> = { my: 1 };
export const DIALOG_BOTTOM_SPACING_SX: SxProps<Theme> = { mb: 1 };
export const DIALOG_FIELD_HELPER_TEXT_SX: SxProps<Theme> = { mx: 0 };
export const DIALOG_TOP_SPACING_SX: SxProps<Theme> = { pt: 1 };
export const DIALOG_FORM_STACK_SPACING = 2;
export const FILE_INPUT_STYLE: CSSProperties = { display: "none" };
export const HIDDEN_FLEX_CHILD_SX: SxProps<Theme> = {
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
};
export const ICON_VERTICAL_ALIGN_SX: SxProps<Theme> = {
  verticalAlign: "middle",
};
export const LIST_OVERFLOW_HIDDEN_SX: SxProps<Theme> = {
  overflow: "hidden",
};
export const LIST_ITEM_SPACING = 1;
export const LIST_ITEM_ICON_SX: SxProps<Theme> = { minWidth: 35 };
export const LIST_SECTION_HEADER_SX: SxProps<Theme> = {
  bgcolor: "transparent",
  color: "text.secondary",
  fontWeight: 600,
  lineHeight: 1,
  px: 2,
  pt: 2,
  pb: 1,
};
export const SVG_NO_SHRINK_STYLE: CSSProperties = { flexShrink: 0 };
export const NO_ROWS_OVERLAY_SVG_WIDTH = 240;
export const NO_ROWS_OVERLAY_SVG_HEIGHT = 200;
export const NO_ROWS_OVERLAY_COLORS = {
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
};
export const COMMENT_PAPER_SX: SxProps<Theme> = { p: 1, mb: 1 };
export const COMMENT_TEXT_SX: SxProps<Theme> = { fontStyle: "italic" };

// App shell
export const APP_BAR_HEIGHT = 64;
export const MAIN_MENU_DRAWER_WIDTH = 240;
export const MAIN_CONTENT_SX = (drawerIsVisible: boolean): SxProps<Theme> => ({
  ml: drawerIsVisible ? { md: `${MAIN_MENU_DRAWER_WIDTH}px` } : 0,
  transition: (theme) =>
    theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
});
export const APP_BAR_SX = (
  mainMenuDrawerIsVisible: boolean,
  profileDrawerIsOpen: boolean
): SxProps<Theme> => ({
  bgcolor: "background.default",
  borderBottom: 1,
  borderColor: "divider",
  ml: {
    md: mainMenuDrawerIsVisible ? `${MAIN_MENU_DRAWER_WIDTH}px` : 0,
  },
  width: {
    md: mainMenuDrawerIsVisible
      ? `calc(100% - ${MAIN_MENU_DRAWER_WIDTH}px)`
      : "100%",
  },
  zIndex: (theme) =>
    profileDrawerIsOpen
      ? theme.zIndex.drawer - 1
      : theme.zIndex.drawer + 1,
  transition: (theme) =>
    theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
});
export const APP_BAR_TOOLBAR_SX: SxProps<Theme> = {
  minHeight: APP_BAR_HEIGHT,
  pl: 2,
  pr: 2,
};
export const APP_BAR_SPACER_SX: SxProps<Theme> = {
  minHeight: APP_BAR_HEIGHT,
};
export const MAIN_MENU_BUTTON_SX = (
  mainMenuDrawerIsOpen: boolean
): SxProps<Theme> => ({
  mr: 1,
  display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
});
export const APP_BAR_BRAND_LINK_SX: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  color: "inherit",
  maxWidth: "100%",
  minWidth: 0,
  textDecoration: "none",
  width: "fit-content",
};
export const APP_BAR_LOGO_SX: SxProps<Theme> = {
  display: "block",
  flexShrink: 0,
  width: 36,
  height: 36,
  mr: 0.5,
};
export const ELLIPSIS_TEXT_SX: SxProps<Theme> = {
  color: "inherit",
  overflow: "hidden",
  textDecoration: "none",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const TENANT_PICKER_SX: SxProps<Theme> = {
  flex: "0 1 auto",
  maxWidth: { xs: 140, sm: 220 },
  minWidth: 0,
  mr: 1,
  width: { xs: "30vw", sm: 220 },
  "& .MuiSelect-select": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
export const NOTIFICATION_POPOVER_TEXT_SX: SxProps<Theme> = {
  p: 2,
  maxWidth: 280,
};
export const MAIN_MENU_DRAWER_NAV_SX = (
  drawerIsOpen: boolean
): SxProps<Theme> => ({
  width: {
    md: drawerIsOpen ? MAIN_MENU_DRAWER_WIDTH : 0,
  },
  flexShrink: { md: 0 },
  transition: (theme) =>
    theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
});
export const MAIN_MENU_DRAWER_TOOLBAR_SX: SxProps<Theme> = {
  justifyContent: "flex-end",
  minHeight: APP_BAR_HEIGHT,
  px: 1,
};
export const DRAWER_PAPER_SX: SxProps<Theme> = {
  "& .MuiDrawer-paper": {
    boxSizing: "border-box",
    width: MAIN_MENU_DRAWER_WIDTH,
  },
};
export const TEMPORARY_DRAWER_SX: SxProps<Theme> = {
  display: { xs: "block", md: "none" },
  ...DRAWER_PAPER_SX,
};
export const PERSISTENT_DRAWER_SX: SxProps<Theme> = {
  display: { xs: "none", md: "block" },
  ...DRAWER_PAPER_SX,
};
export const DRAWER_COMPOSE_ACTION_CONTAINER_SX: SxProps<Theme> = {
  px: 2,
  pb: 1,
};
export const DRAWER_COMPOSE_BUTTON_SX: SxProps<Theme> = {
  justifyContent: "center",
  borderColor: "divider",
  borderRadius: 1,
  px: 2,
  py: 1.25,
  textTransform: "none",
  "&:hover": {
    borderColor: "text.secondary",
    bgcolor: "action.hover",
  },
};
export const PROFILE_DRAWER_CONTENT_SX: SxProps<Theme> = { minWidth: 280 };
export const BACKDROP_LOADING_SX: SxProps<Theme> = {
  color: "#fff",
  zIndex: (theme) => theme.zIndex.modal + 1,
};
export const TENANT_WELCOME_CONTAINER_SX: SxProps<Theme> = {
  p: 3,
  maxWidth: 560,
};
export const USER_SETTINGS_CONTAINER_SX: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

// Data grids
export const DATA_GRID_CONTAINER_SX = FULL_WIDTH_OVERFLOW_HIDDEN_SX;
export const DATA_GRID_SX: SxProps<Theme> = {
  border: "none",
  "--DataGrid-overlayHeight": "300px",
};
export const APPROVAL_GRID_COLUMN_FLEX = {
  content: 5,
  metadata: 3,
  action: 2,
};
export const TENANT_USERS_GRID_COLUMN_SIZING = {
  email: { flex: 3, minWidth: 220 },
  firstName: { flex: 2, minWidth: 130 },
  lastName: { flex: 2, minWidth: 130 },
  position: { flex: 2, minWidth: 150 },
  role: { flex: 1, minWidth: 110 },
  status: { flex: 1, minWidth: 120 },
  action: { flex: 1, minWidth: 90 },
};
export const COMMENT_TEXT_FIELD_ROWS = 4;
export const TENANT_DIALOG_MAX_WIDTH = "sm";

// Menus
export const MENU_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "bottom",
  horizontal: "right",
};

export const MENU_TRANSFORM_ORIGIN: PopoverOrigin = {
  horizontal: 40,
  vertical: "top",
};

export const NOTIFICATION_POPOVER_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "bottom",
  horizontal: "right",
};

export const NOTIFICATION_POPOVER_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

// Validation
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_VALIDATION_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i;
export const PASSWORD_VALIDATOR = new passwordValidator();
PASSWORD_VALIDATOR.is()
  .min(PASSWORD_MIN_LENGTH)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols();
export const PASSWORD_VALIDATOR_ERROR = `Password must be min ${PASSWORD_MIN_LENGTH} chars,
  have at least one lower case letter,
  one uppercase letter,
  one digit,
  and one symbol`;
export const ACCOUNT_MAX_FAILED_ATTEMPTS_TO_SIGN_IN = 3;
export const ACCOUNT_LOCK_OUT_TIME_IN_MINUTES = 5;
export const UNKNOWN_ERROR_MESSAGE = "Unknown error occurred.";

// Navigation
export const DEFAULT_PATH = "/inbox";
