import { readColorMode, writeColorMode } from "@/shared/session/session";
import { createAppTheme } from "@/shared/theme/createAppTheme";
import { PaletteMode, Theme } from "@mui/material";
import { makeAutoObservable, runInAction } from "mobx";

export class UserPreferencesStore {
  theme: Theme;

  constructor(theme: Theme = createAppTheme(readColorMode())) {
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
