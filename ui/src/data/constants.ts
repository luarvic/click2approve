import { PopoverOrigin } from "@mui/material";
import passwordValidator from "password-validator";

// API
export const API_BASE_URI = import.meta.env.VITE_API_BASE_URI;
export const UI_BASE_URI = import.meta.env.VITE_UI_BASE_URI;
export const API_TIMEOUT_MS = 10000;
export const EMAIL_SERVICE_IS_ENABLED: boolean =
  import.meta.env.VITE_EMAIL_SERVICE_IS_ENABLED === "true";

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

// Menus
export const MENU_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "bottom",
  horizontal: "right",
};

export const MENU_SLOT_PROPS = {
  paper: {
    elevation: 0,
    sx: {
      overflow: "visible",
      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
      mt: 1.5,
      "& .MuiAvatar-root": {
        width: 32,
        height: 32,
        ml: -0.5,
        mr: 1,
      },
      "&::before": {
        content: '""',
        display: "block",
        position: "absolute",
        top: 0,
        right: 27,
        width: 10,
        height: 10,
        bgcolor: "background.paper",
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
      },
    },
  },
};

export const MENU_TRANSFORM_ORIGIN: PopoverOrigin = {
  horizontal: 40,
  vertical: "top",
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
export const DEFAULT_PATH = "/files";
