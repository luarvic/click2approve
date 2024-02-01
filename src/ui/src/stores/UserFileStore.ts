import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { IUserFile } from "../models/UserFile";
import {
  downloadFile,
  downloadFileBase64,
  getUserFiles,
  uploadFiles,
} from "../utils/ApiClient";

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

  addUserFiles = async (files: FileList) => {
    const fileNames = Array.from(files, (file) => file.name);
    toast.info(`Uploading file(s): ${fileNames.toString()}`, {});
    const userFiles = await uploadFiles(files);
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created);
      const base64String = await downloadFileBase64(userFile.id, true);
      userFile.thumbnail = base64String;
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
    toast.success(`File(s) uploaded: ${fileNames.toString()}`);
  };

  clearUserFiles = () => {
    runInAction(() => {
      this.registry.clear();
    });
  };

  handleUserFileCheckbox = (id: string, checked: boolean) => {
    const userFile = this.registry.get(id);
    if (userFile !== undefined) {
      runInAction(() => {
        userFile.checked = checked;
      });
    }
  };

  getSelectedUserFileIds = (): string[] => {
    const selectedIds: string[] = [];
    this.registry.forEach((f) => {
      if (f.checked) {
        selectedIds.push(f.id);
      }
    });
    return selectedIds;
  };
}

export const userFileStoreContext = createContext(
  new UserFileStore(new Map<string, IUserFile>())
);
