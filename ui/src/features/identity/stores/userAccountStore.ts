import { stores } from "@/app/stores";
import {
  getUserAccountManageInfo,
  loginUser,
  registerUser,
  requestUserPasswordReset,
  resendUserConfirmationEmail,
  resetUserPassword,
} from "@/features/identity/api/authApi";
import { CredentialsData } from "@/features/identity/models/credentials";
import { UserAccount } from "@/features/identity/models/userAccount";
import { deleteTokens, readTokens } from "@/shared/session/session";
import { makeAutoObservable, runInAction } from "mobx";

export class UserAccountStore {
  currentUser: UserAccount | null | undefined; // undefined means we don't know yet if it's authenticated or anonymous user

  constructor(currentUser: UserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  signUp = async (credentials: CredentialsData): Promise<boolean> => {
    return await registerUser(credentials);
  };

  signIn = async (credentials: CredentialsData): Promise<boolean> => {
    if (this.currentUser) {
      this.signOut();
    }
    if (await loginUser(credentials)) {
      return await this.signInWithCachedToken();
    }
    return false;
  };

  resendConfirmationEmail = async (email: string): Promise<boolean> => {
    return await resendUserConfirmationEmail(email);
  };

  sendResetPasswordLink = async (email: string): Promise<boolean> => {
    return await requestUserPasswordReset(email);
  };

  resetPassword = async (
    email: string,
    code: string,
    password: string
  ): Promise<boolean> => {
    return await resetUserPassword(email, code, password);
  };

  signInWithCachedToken = async (): Promise<boolean> => {
    const tokens = readTokens();
    if (tokens) {
      const currentUser = await getUserAccountManageInfo();
      if (currentUser) {
        if (stores.productStore.tenantsAreEnabled) {
          await stores.tenantStore.load();
        }
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
    stores.tenantStore.clear();
    stores.employeeStore.clear();
    runInAction(() => {
      this.currentUser = null;
    });
  };
}
