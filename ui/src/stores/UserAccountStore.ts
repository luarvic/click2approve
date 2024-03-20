import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { ICredentials } from "../models/Credentials";
import { IUserAccount } from "../models/UserAccount";
import { getUserInfo, signInUser, signUpUser } from "../utils/ApiClient";
import { deleteTokens, readTokens } from "../utils/CacheClient";

class UserAccountStore {
  currentUser: IUserAccount | undefined;

  constructor(currentUser: IUserAccount | undefined = undefined) {
    this.currentUser = currentUser;
    makeAutoObservable(this);
  }

  signUp = async (credentials: ICredentials): Promise<boolean> => {
    if (credentials.password !== credentials.passwordConfirmation) {
      toast.warn("Password and confirmation do not match.");
      return false;
    }
    await signUpUser(credentials);
    if (await this.signIn(credentials)) {
      return false;
    }
    return true;
  };

  signIn = async (credentials: ICredentials): Promise<boolean> => {
    if (this.currentUser) {
      this.signOut();
    }
    await signInUser(credentials);
    return await this.signInWithCachedToken();
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
      } else {
        this.signOut();
      }
    }
    return false;
  };

  signOut = () => {
    deleteTokens();
    runInAction(() => {
      this.currentUser = undefined;
    });
  };
}

export const userAccountStore = new UserAccountStore();
