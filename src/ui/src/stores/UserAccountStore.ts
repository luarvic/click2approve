import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { IUserAccount, UserAccount } from "../models/UserAccount";
import { signInUser, signUpUser, validateToken } from "../utils/ApiClient";

export class UserAccountStore {
  currentUser: IUserAccount | undefined;

  constructor(currentUser: IUserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  cacheUserAccount = () => {
    if (this.currentUser) {
      localStorage.setItem("username", this.currentUser.username);
      localStorage.setItem("token", this.currentUser.token);
    }
  };

  trySigningInWithCachedUserAccount = async () => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (username && token) {
      try {
        await validateToken();
        runInAction(() => {
          this.currentUser = new UserAccount(username, "", "", token);
        });
      } catch {
        this.signOut();
      }
    }
  };

  signUp = async (userAccount: IUserAccount): Promise<boolean> => {
    if (userAccount.password !== userAccount.passwordConfirmation) {
      toast.warn("Password and confirmation do not match.");
      return false;
    }
    try {
      const token = await signUpUser(
        userAccount.username,
        userAccount.password
      );
      runInAction(() => {
        this.currentUser = new UserAccount(userAccount.username, "", "", token);
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
      const token = await signInUser(
        userAccount.username,
        userAccount.password
      );
      runInAction(() => {
        this.currentUser = new UserAccount(userAccount.username, "", "", token);
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
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    runInAction(() => {
      this.currentUser = undefined;
    });
  };
}

export const userAccountStoreContext = createContext(new UserAccountStore());
