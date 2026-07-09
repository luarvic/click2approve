import { AuthResponse } from "@/features/identity/models/authResponse";
import { CredentialsData } from "@/features/identity/models/credentials";
import { UserAccount } from "@/features/identity/models/userAccount";
import axios from "@/shared/api/axios";
import { deleteTokens, writeTokens } from "@/shared/session/session";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const registerUser = async (credentials: CredentialsData): Promise<boolean> => {
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

export const confirmUserEmail = async (
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

export const loginUser = async (credentials: CredentialsData): Promise<boolean> => {
  try {
    const { data } = await axios.post<AuthResponse>("api/account/login", {
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

export const resendUserConfirmationEmail = async (
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

export const requestUserPasswordReset = async (
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

export const resetUserPassword = async (
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

export const refreshAuthSession = async (
  refreshToken: string
): Promise<AuthResponse | null> => {
  try {
    const { data } = await axios.post<AuthResponse>("api/account/refresh", {
      refreshToken: refreshToken,
    });
    writeTokens(data);
    return data;
  } catch (e) {
    return null;
  }
};

export const getUserAccountManageInfo = async (): Promise<UserAccount | null> => {
  try {
    const { data } = await axios.get<UserAccount>("api/account/manage/info");
    return data;
  } catch (e) {
    return null;
  }
};
