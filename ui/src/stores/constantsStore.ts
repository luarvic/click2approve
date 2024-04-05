import { PopoverOrigin, createTheme } from "@mui/material";
import passwordValidator from "password-validator";

// Global settings

// General
export const API_URI = import.meta.env.VITE_API_URI;
export const EMAIL_SERVICE_IS_ENABLED: boolean = JSON.parse(
  import.meta.env.VITE_EMAIL_SERVICE_IS_ENABLED
);

// Toast
export const TOAST_AUTO_CLOSE = 3000;
export const TOAST_LIMIT = 2;
export const TOAST_CLOSE_BUTTON = true;
export const TOAST_DRAGGABLE = false;
export const DATA_GRID_DEFAULT_PAGE_SIZE = 10;

// Theme
export const THEME = createTheme({});

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
        right: 14,
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
export const PASSWORD_VALIDATOR_ERROR = `Password must be min ${PASSWORD_MIN_LENGTH} chars, have at least one lower case letter, one uppercase letter, one digit, and one symbol`;

// Navigation
export const DEFAULT_PATH = "/inbox";
