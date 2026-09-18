import {
  getUserAccountManageInfo,
  loginUser,
  registerUser,
  requestUserPasswordReset,
  resendUserConfirmationEmail,
  resetUserPassword,
} from "@/features/identity/api/authApi";
import { signInWithPasskey } from "@/features/identity/api/passkeysApi";
import { CredentialsData } from "@/features/identity/models/credentials";
import { MfaRequired } from "@/features/identity/models/mfa";
import { UserAccount } from "@/features/identity/models/userAccount";
import { deleteTokens, readTokens } from "@/shared/session/session";
import { makeAutoObservable, runInAction } from "mobx";

export class UserAccountStore {
  currentUser: UserAccount | null | undefined; // undefined means we don't know yet if it's authenticated or anonymous user
  isManualSignOut = false;
  passkeyEnrollmentPending = false;
  private clearSession: () => void = () => undefined;
  private initializeSession: () => Promise<void> = async () => undefined;

  constructor(currentUser: UserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  configureSessionLifecycle = (initializeSession: () => Promise<void>, clearSession: () => void): void => {
    this.initializeSession = initializeSession;
    this.clearSession = clearSession;
  };

  signUp = async (credentials: CredentialsData): Promise<boolean> => {
    return await registerUser(credentials);
  };

  signIn = async (credentials: CredentialsData): Promise<boolean | MfaRequired> => {
    const result = await loginUser(credentials);
    if (typeof result === "object") return result;
    if (result) {
      return await this.signInWithCachedToken({ promptForPasskey: true });
    }
    return false;
  };

  signInWithPasskey = async (): Promise<boolean> => {
    if (await signInWithPasskey()) {
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

  resetPassword = async (email: string, code: string, password: string): Promise<boolean> => {
    return await resetUserPassword(email, code, password);
  };

  signInWithCachedToken = async ({
    promptForPasskey = false,
  }: { promptForPasskey?: boolean } = {}): Promise<boolean> => {
    this.passkeyEnrollmentPending = false;
    const tokens = readTokens();
    if (tokens) {
      this.clearSession();
      runInAction(() => {
        this.currentUser = undefined;
        this.isManualSignOut = false;
      });
      const currentUser = await getUserAccountManageInfo();
      if (currentUser) {
        await this.initializeSession();
        if (this.currentUser !== undefined) {
          return false;
        }
        runInAction(() => {
          this.currentUser = currentUser;
          this.passkeyEnrollmentPending = promptForPasskey;
        });
        return true;
      }
    }
    this.signOut();
    return false;
  };

  signOut = (isManual = false) => {
    deleteTokens();
    this.clearSession();
    runInAction(() => {
      this.isManualSignOut = isManual;
      this.currentUser = null;
      this.passkeyEnrollmentPending = false;
    });
  };

  synchronizeWithSharedSession = async (): Promise<void> => {
    if (!readTokens()) {
      this.signOut(true);
      return;
    }

    await this.signInWithCachedToken();
  };

  completePasskeyEnrollmentPrompt = () => {
    this.passkeyEnrollmentPending = false;
  };

  clearManualSignOut = () => {
    if (!this.isManualSignOut) return;
    this.isManualSignOut = false;
  };
}
