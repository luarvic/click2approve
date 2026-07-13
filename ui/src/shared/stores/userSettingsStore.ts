import { InputFields } from "@/shared/constants/constants";
import { readColorMode, writeColorMode } from "@/shared/session/session";
import { PaletteMode, Theme, createTheme } from "@mui/material";
import { makeAutoObservable, runInAction } from "mobx";

const createAppTheme = (colorMode: PaletteMode) =>
  createTheme({
    typography: { fontFamily: "Sora, sans-serif" },
    palette: { mode: colorMode },
    components: {
      MuiFormControl: {
        defaultProps: { variant: InputFields.variant },
      },
      MuiTextField: {
        defaultProps: { variant: InputFields.variant },
      },
    },
  });

export class UserSettingsStore {
  theme: Theme;

  constructor(
    theme: Theme = createAppTheme(readColorMode()),
  ) {
    this.theme = theme;
    makeAutoObservable(this);
  }

  setColorMode = (colorMode: PaletteMode) => {
    runInAction(() => {
      this.theme = createAppTheme(colorMode);
    });
    writeColorMode(colorMode);
  };
}
