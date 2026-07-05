import { PaletteMode } from "@mui/material";
import { IAuthResponse } from "../models/authResponse";

const STORAGE_ITEM_KEY: string = "tokens";
const COLOR_MODE_KEY: string = "colorMode";
const CURRENT_TENANT_ID_KEY: string = "currentTenantId";

export const writeTokens = (data: IAuthResponse) => {
  localStorage.setItem(STORAGE_ITEM_KEY, JSON.stringify(data));
};

export const readTokens = (): IAuthResponse | null => {
  const dataJson = localStorage.getItem(STORAGE_ITEM_KEY);
  if (dataJson) {
    return JSON.parse(dataJson) as IAuthResponse;
  } else {
    return null;
  }
};

export const deleteTokens = () => {
  localStorage.removeItem(STORAGE_ITEM_KEY);
};

export const writeColorMode = (colorMode: PaletteMode) => {
  localStorage.setItem(COLOR_MODE_KEY, colorMode);
};

export const readColorMode = (): PaletteMode => {
  const colorMode = localStorage.getItem(COLOR_MODE_KEY);
  return colorMode ? (colorMode as PaletteMode) : "light";
};

export const writeCurrentTenantId = (tenantId: number) => {
  localStorage.setItem(CURRENT_TENANT_ID_KEY, tenantId.toString());
};

export const readCurrentTenantId = (): number | null => {
  const value = localStorage.getItem(CURRENT_TENANT_ID_KEY);
  return value ? Number(value) : null;
};

export const deleteCurrentTenantId = () => {
  localStorage.removeItem(CURRENT_TENANT_ID_KEY);
};
