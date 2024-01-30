import { makeAutoObservable, runInAction } from "mobx";
import { IUserFile } from "../models/UserFile";
import {
  getUserFiles,
  downloadFile,
  downloadFileBase64,
} from "../utils/ApiClient";
import { createContext } from "react";

export class UserFileStore {
  registry: Map<string, IUserFile>;

  get userFiles(): IUserFile[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
    );
  }

  constructor(registry: Map<string, IUserFile>) {
    this.registry = registry;
    makeAutoObservable(this);
  }

  loadUserFiles = async () => {
    const userFiles = await getUserFiles();
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created + "Z");
      const base64String = await downloadFileBase64(userFile.id, true);
      userFile.thumbnail = base64String;
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
  };

  addUserFiles = async (userFiles: IUserFile[]) => {
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created);
      const base64String = await downloadFileBase64(userFile.id, true);
      userFile.thumbnail = base64String;
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
  };
}

export const userFileStoreContext = createContext(
  new UserFileStore(new Map<string, IUserFile>())
);
