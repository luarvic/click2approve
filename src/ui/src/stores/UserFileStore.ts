import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { IUserFile } from "../models/UserFile";
import {
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
    try {
      const userFiles = await getUserFiles();
      userFiles.forEach(async (userFile) => {
        userFile.createdDate = new Date(userFile.created + "Z");
        const base64String = await downloadFileBase64(userFile.id, true);
        runInAction(() => {
          this.registry.set(userFile.id, userFile);
        });
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load file(s).");
      }
    }
  };

  addUserFiles = async (files: FileList) => {
    try {
      const fileNames = Array.from(files, (file) => file.name);
      toast.info(`Uploading file(s): ${fileNames.toString()}`, {});
      const userFiles = await uploadFiles(files);
      userFiles.forEach(async (userFile) => {
        userFile.createdDate = new Date(userFile.created);
        const base64String = await downloadFileBase64(userFile.id, true);
        runInAction(() => {
          this.registry.set(userFile.id, userFile);
        });
      });
      toast.success(`File(s) uploaded: ${fileNames.toString()}`);
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load file(s).");
      }
    }
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

  getSelectedUserFiles = (): IUserFile[] => {
    return Array.from(this.registry.values()).filter(
      (userFile) => userFile.checked
    );
  };

  incrementDownloadCount = () => {
    this.getSelectedUserFiles().forEach((f) => f.downloadCount++);
  };
}

export const userFileStoreContext = createContext(
  new UserFileStore(new Map<string, IUserFile>())
);
