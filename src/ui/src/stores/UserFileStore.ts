import { makeAutoObservable, runInAction } from "mobx";
import { IUserFile } from "../models/UserFile";
import { getUserFiles } from "../utils/ApiClient";
import { createContext } from "react";

export class UserFileStore {
    registry: Map<string, IUserFile>;

    get userFiles(): IUserFile[] {
        return Array.from(this.registry.values());
    }

    constructor(
        registry: Map<string, IUserFile>
    ) {
        this.registry = registry;
        makeAutoObservable(this);
    }

    loadUserFiles = async () => {
        const userFiles = await getUserFiles();
        runInAction(() => {
            userFiles.forEach(userFile => {
                userFile.createdDate = new Date(userFile.created);
                this.registry.set(userFile.id, userFile);
            });
        });
    }
}

export const userFileStoreContext = createContext(new UserFileStore(new Map<string, IUserFile>()));
