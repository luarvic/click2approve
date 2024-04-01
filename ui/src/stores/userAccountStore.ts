import { makeAutoObservable, runInAction } from "mobx";
import { ICredentials } from "../models/credentials";
import { IUserAccount } from "../models/userAccount";
import {
  accountForgotPassword,
  accountManageInfo,
  accountResendConfirmationEmail,
  accountResetPassword,
  login,
  register,
} from "../utils/apiClient";
import { deleteTokens, readTokens } from "../utils/cacheClient";

export class UserAccountStore {
  currentUser: IUserAccount | null | undefined; // undefined means we don't know yet if it's authenticated or anonymous user

  constructor(currentUser: IUserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  signUp = async (credentials: ICredentials): Promise<boolean> => {
    return await register(credentials);
  };

  signIn = async (credentials: ICredentials): Promise<boolean> => {
    if (this.currentUser) {
      this.signOut();
    }
    if (await login(credentials)) {
      return await this.signInWithCachedToken();
    }
    return false;
  };

  resendConfirmationEmail = async (email: string): Promise<boolean> => {
    return await accountResendConfirmationEmail(email);
  };

  sendResetPasswordLink = async (email: string): Promise<boolean> => {
    return await accountForgotPassword(email);
  };

  resetPassword = async (
    email: string,
    code: string,
    password: string
  ): Promise<boolean> => {
    return await accountResetPassword(email, code, password);
  };

  signInWithCachedToken = async (): Promise<boolean> => {
    const tokens = readTokens();
    if (tokens) {
      const currentUser = await accountManageInfo();
      if (currentUser) {
        runInAction(() => {
          this.currentUser = currentUser;
        });
        return true;
      }
    }
    this.signOut();
    return false;
  };

  signOut = () => {
    deleteTokens();
    runInAction(() => {
      this.currentUser = null;
    });
  };
}
