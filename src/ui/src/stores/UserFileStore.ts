import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IUserFile } from "../models/UserFile";
import { listUserFiles, uploadFiles } from "../utils/ApiClient";

class UserFileStore {
  userFilesRegistry: Map<string, IUserFile>;

  get userFiles(): IUserFile[] {
    return Array.from(this.userFilesRegistry.values()).sort(
      (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
    );
  }

  constructor(userFilesRegistry: Map<string, IUserFile>) {
    this.userFilesRegistry = userFilesRegistry;
    makeAutoObservable(this);
  }

  loadUserFiles = async () => {
    try {
      const userFiles = await listUserFiles();
      userFiles.forEach(async (userFile) => {
        userFile.createdDate = new Date(userFile.created + "Z");
        runInAction(() => {
          this.userFilesRegistry.set(userFile.id, userFile);
        });
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load user files.");
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
          this.userFilesRegistry.set(userFile.id, userFile);
        });
      });
      toast.success(`File(s) uploaded: ${fileNames.toString()}`);
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to add file(s).");
      }
    }
  };

  clearUserFiles = () => {
    runInAction(() => {
      this.userFilesRegistry.clear();
    });
  };

  handleUserFileCheckbox = (ids: string[]) => {
    this.userFilesRegistry.forEach((userFile) => {
      const checkedInUi = ids.includes(userFile.id);
      if (checkedInUi !== userFile.checked) {
        runInAction(() => {
          userFile.checked = checkedInUi;
        });
      }
    });
  };

  getSelectedUserFiles = (): IUserFile[] => {
    return Array.from(this.userFilesRegistry.values()).filter(
      (userFile) => userFile.checked
    );
  };
}

export const userFileStore = new UserFileStore(new Map<string, IUserFile>());
