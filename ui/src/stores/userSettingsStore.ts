import { PaletteMode, Theme, createTheme } from "@mui/material";
import { makeAutoObservable, runInAction } from "mobx";
import { readColorMode, writeColorMode } from "../lib/session";

export class UserSettingsStore {
  theme: Theme;

  constructor(
    theme: Theme = createTheme({
      typography: { fontFamily: "Sora, sans-serif" },
      palette: { mode: readColorMode() }
    })
  ) {
    this.theme = theme;
    makeAutoObservable(this);
  }

  setColorMode = (colorMode: PaletteMode) => {
    runInAction(() => {
      this.theme = createTheme({
        typography: { fontFamily: "Sora, sans-serif" },
        palette: { mode: colorMode },
      });
    });
    writeColorMode(colorMode);
  };
}
