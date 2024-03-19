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

  trySigningInWithCachedToken = async () => {
    try {
      const tokens = readTokens();
      if (tokens) {
        const currentUser = await getUserInfo();
        runInAction(() => {
          this.currentUser = currentUser;
        });
      }
    } catch {
      this.signOut();
    }
  };

  signUp = async (credentials: ICredentials): Promise<boolean> => {
    if (credentials.password !== credentials.passwordConfirmation) {
      toast.warn("Password and confirmation do not match.");
      return false;
    }
    try {
      await signUpUser(credentials);
      await this.signIn(credentials);
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

  signIn = async (credentials: ICredentials): Promise<boolean> => {
    try {
      await signInUser(credentials);
      const currentUser = await getUserInfo();
      runInAction(() => {
        this.currentUser = currentUser;
      });
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
    deleteTokens();
    runInAction(() => {
      this.currentUser = undefined;
    });
  };
}

export const userAccountStore = new UserAccountStore();
