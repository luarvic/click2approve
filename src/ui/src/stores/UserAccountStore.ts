import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { IUserAccount, UserAccount } from "../models/UserAccount";
import { signInUser, signUpUser } from "../utils/ApiClient";

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

  getCachedUserAccount = () => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (username && token) {
      runInAction(() => {
        this.currentUser = new UserAccount(username, "", "", token);
      });
    }
  };

  signUp = async (userAccount: IUserAccount) => {
    if (userAccount.password !== userAccount.passwordConfirmation) {
      toast.error("Password and confirmation do not match.");
      return;
    }
    const token = await signUpUser(userAccount.username, userAccount.password);
    runInAction(() => {
      this.currentUser = new UserAccount(userAccount.username, "", "", token);
    });
    this.cacheUserAccount();
  };

  signIn = async (userAccount: IUserAccount) => {
    const token = await signInUser(userAccount.username, userAccount.password);
    runInAction(() => {
      this.currentUser = new UserAccount(userAccount.username, "", "", token);
    });
    this.cacheUserAccount();
  };

  signOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    runInAction(() => {
      this.currentUser = undefined;
    });
  };
}

export const userUserAccountContext = createContext(new UserAccountStore());
