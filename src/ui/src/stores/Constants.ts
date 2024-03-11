import { createTheme } from "@mui/material";

export const API_URI = process.env.REACT_APP_API_URI;
export const TOAST_AUTO_CLOSE = 10000;
export const TOAST_LIMIT = 2;
export const TOAST_CLOSE_BUTTON = true;
export const TOAST_DRAGGABLE = false;
export const DATA_GRID_DEFAULT_PAGE_SIZE = 10;
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
