import { createTheme } from "@mui/material";
import passwordValidator from "password-validator";

// General parameters.
export const API_URI = import.meta.env.VITE_API_URI;
export const EMAIL_SERVICE_IS_ENABLED: boolean = JSON.parse(
  import.meta.env.VITE_EMAIL_SERVICE_IS_ENABLED
);

// Toast parameters.
export const TOAST_AUTO_CLOSE = 3000;
export const TOAST_LIMIT = 2;
export const TOAST_CLOSE_BUTTON = true;
export const TOAST_DRAGGABLE = false;
export const DATA_GRID_DEFAULT_PAGE_SIZE = 10;

// Theme parameters.
export const THEME = createTheme({
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "0 20px 20px 0",
        },
      },
    },
  },
});

// Validation parameters.
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

// Navigation.
export const DEFAULT_PATH = "/inbox";
