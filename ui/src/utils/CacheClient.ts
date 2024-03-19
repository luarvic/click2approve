import { IAuthResponse } from "../models/AuthResponse";

const STORAGE_ITEM_KEY: string = "tokens";

export const writeTokens = (data: IAuthResponse): void => {
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

export const deleteTokens = (): void => {
  localStorage.removeItem(STORAGE_ITEM_KEY);
};
