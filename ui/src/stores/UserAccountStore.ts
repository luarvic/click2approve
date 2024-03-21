import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { ICredentials } from "../models/Credentials";
import { IUserAccount } from "../models/UserAccount";
import { getUserInfo, signInUser, signUpUser } from "../utils/ApiClient";
import { deleteTokens, readTokens } from "../utils/CacheClient";

class UserAccountStore {
  currentUser: IUserAccount | null | undefined; // undefined means we don't know yet if it's authenticated or anonymous user

  constructor(currentUser: IUserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  signUp = async (credentials: ICredentials): Promise<boolean> => {
    if (await signUpUser(credentials)) {
      return await this.signIn(credentials);
    }
    return false;
  };

  signIn = async (credentials: ICredentials): Promise<boolean> => {
    if (this.currentUser) {
      this.signOut();
    }
    if (await signInUser(credentials)) {
      return await this.signInWithCachedToken();
    }
    return false;
  };

  signInWithCachedToken = async (): Promise<boolean> => {
    const tokens = readTokens();
    if (tokens) {
      const currentUser = await getUserInfo();
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

export const userAccountStore = new UserAccountStore();
