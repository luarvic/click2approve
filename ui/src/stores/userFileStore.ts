import { makeAutoObservable, runInAction } from "mobx";
import { fileList, fileUpload } from "../lib/controllers/userFile";
import { IUserFile } from "../models/userFile";

export class UserFileStore {
  registry: Map<number, IUserFile>;
  currentUserFile: IUserFile | null;

  constructor(
    userFilesRegistry: Map<number, IUserFile> = new Map<number, IUserFile>(),
    currentUserFile = null
  ) {
    this.registry = userFilesRegistry;
    this.currentUserFile = currentUserFile;
    makeAutoObservable(this);
  }

  get userFiles(): IUserFile[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
    );
  }

  loadUserFiles = async () => {
    const userFiles = await fileList();
    userFiles.forEach(async (userFile) => {
      userFile.createdDate = new Date(userFile.created + "Z");
      runInAction(() => {
        this.registry.set(userFile.id, userFile);
      });
    });
  };

  addUserFiles = async (files: FileList) => {
    const userFiles = await fileUpload(files);
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

  handleUserFileCheckbox = (ids: number[]) => {
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

  setCurrentUSerFile = (userFile: IUserFile | null) => {
    runInAction(() => {
      this.currentUserFile = userFile;
    });
  };
}
