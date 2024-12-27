import { toast } from "react-toastify";
import { IAuthResponse } from "../../models/authResponse";
import { ICredentials } from "../../models/credentials";
import { IUserAccount } from "../../models/userAccount";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";
import { deleteTokens, writeTokens } from "../session";

export const register = async (credentials: ICredentials): Promise<boolean> => {
  try {
    await axios.post("api/account/register", {
      email: credentials.email,
      password: credentials.password,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const confirmEmail = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    await axios.get(`api/account/confirmEmail?userId=${userId}&code=${code}`);
    return true;
  } catch {
    toast.error("Email confirmation failed.");
    return false;
  }
};

export const login = async (credentials: ICredentials): Promise<boolean> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/login", {
      email: credentials.email,
      password: credentials.password,
    });
    writeTokens(data);
    return true;
  } catch (e) {
    deleteTokens();
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountResendConfirmationEmail = async (
  email: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/resendConfirmationEmail", {
      email: email,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountForgotPassword = async (
  email: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/forgotPassword", {
      email: email,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountResetPassword = async (
  email: string,
  code: string,
  password: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/resetPassword", {
      email: email,
      resetCode: code,
      newPassword: password,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountRefresh = async (
  refreshToken: string
): Promise<IAuthResponse | null> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/refresh", {
      refreshToken: refreshToken,
    });
    writeTokens(data);
    return data;
  } catch (e) {
    return null;
  }
};

export const accountManageInfo = async (): Promise<IUserAccount | null> => {
  try {
    const { data } = await axios.get<IUserAccount>("api/account/manage/info");
    return data;
  } catch (e) {
    return null;
  }
};
