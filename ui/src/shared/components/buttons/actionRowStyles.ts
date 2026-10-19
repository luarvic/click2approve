import type { CSSObject, Theme } from "@mui/material/styles";

/** Balance visible gaps while preserving each button's padding and click target. */
export const actionRowStyles = (theme: Theme): CSSObject => ({
  columnGap: 0,
  "& > .MuiButton-root ~ .MuiButton-root": {
    marginLeft: 0,
    marginInlineStart: theme.spacing(1),
  },
  "& > .MuiButton-text + .MuiButton-text": {
    marginInlineStart: 0,
  },
  "& > .MuiButton-text + .MuiButton-contained, & > .MuiButton-contained + .MuiButton-text": {
    marginInlineStart: theme.spacing(2),
  },
});
