import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IUserFile } from "../models/UserFile";
import { getUserFiles, uploadFiles } from "../utils/ApiClient";

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

export const userFileStore = new UserFileStore(new Map<string, IUserFile>());
