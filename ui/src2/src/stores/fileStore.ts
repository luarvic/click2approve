import { makeAutoObservable, runInAction } from "mobx";
import { IUserFile } from "../models/userFile";
import { listFiles, uploadFiles } from "../utils/apiClient";

class FileStore {
  registry: Map<string, IUserFile>;

  get userFiles(): IUserFile[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
    );
  }

  constructor(userFilesRegistry: Map<string, IUserFile>) {
    this.registry = userFilesRegistry;
    makeAutoObservable(this);
  }

  loadUserFiles = async () => {
    const userFiles = await listFiles();
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created + "Z");
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
  };

  addUserFiles = async (files: FileList) => {
    const userFiles = await uploadFiles(files);
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created);
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
  };

  clearUserFiles = () => {
    runInAction(() => {
      this.registry.clear();
    });
  };

  handleUserFileCheckbox = (ids: string[]) => {
    this.registry.forEach((userFile) => {
      const checkedInUi = ids.includes(userFile.id);
      if (checkedInUi !== userFile.checked) {
        runInAction(() => {
          userFile.checked = checkedInUi;
        });
      }
    });
  };

  getSelectedUserFiles = (): IUserFile[] => {
    return Array.from(this.registry.values()).filter(
      (userFile) => userFile.checked
    );
  };
}

export const fileStore = new FileStore(new Map<string, IUserFile>());
