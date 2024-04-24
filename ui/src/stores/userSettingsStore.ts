import { PaletteMode, Theme, createTheme } from "@mui/material";
import { makeAutoObservable, runInAction } from "mobx";
import { readColorMode, writeColorMode } from "../lib/session";

export class UserSettingsStore {
  theme: Theme;

  constructor(
    theme: Theme = createTheme({ palette: { mode: readColorMode() } })
  ) {
    this.theme = theme;
    makeAutoObservable(this);
  }

  setColorMode = (colorMode: PaletteMode) => {
    runInAction(() => {
      this.theme = createTheme({
        palette: { mode: colorMode },
      });
    });
    writeColorMode(colorMode);
  };
}
