import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { IUserAccount, UserAccount } from "../models/UserAccount";
import { signInUser, signUpUser, validateToken } from "../utils/ApiClient";

export class UserAccountStore {
  // Null means anonymous user.
  // Undefined means we don't yet know whether the user is anonymous or authenticated.
  currentUser: IUserAccount | undefined | null;

  constructor(currentUser: IUserAccount | undefined | null = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  cacheUserAccount = () => {
    if (this.currentUser) {
      localStorage.setItem("email", this.currentUser.email);
      localStorage.setItem("token", this.currentUser.token);
    }
  };

  trySigningInWithCachedUserAccount = async () => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    if (email && token) {
      try {
        await validateToken();
        runInAction(() => {
          this.currentUser = new UserAccount(email, "", "", token);
        });
      } catch {
        this.signOut();
      }
    } else {
      runInAction(() => {
        this.currentUser = null;
      });
    }
  };

  signUp = async (userAccount: IUserAccount): Promise<boolean> => {
    if (userAccount.password !== userAccount.passwordConfirmation) {
      toast.warn("Password and confirmation do not match.");
      return false;
    }
    try {
      await signUpUser(userAccount.email, userAccount.password);
      const token = await signInUser(userAccount.email, userAccount.password);
      runInAction(() => {
        this.currentUser = new UserAccount(userAccount.email, "", "", token);
      });
      this.cacheUserAccount();
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to sign up.");
      }
      return false;
    }
    return true;
  };

  signIn = async (userAccount: IUserAccount): Promise<boolean> => {
    try {
      const token = await signInUser(userAccount.email, userAccount.password);
      runInAction(() => {
        this.currentUser = new UserAccount(userAccount.email, "", "", token);
      });
      this.cacheUserAccount();
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to sign in.");
      }
      return false;
    }
    return true;
  };

  signOut = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    runInAction(() => {
      this.currentUser = null;
    });
  };
}

export const userAccountStoreContext = createContext(new UserAccountStore());
