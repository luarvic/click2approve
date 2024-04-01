import { IUserFile } from "../models/userFile";
import { fileDownloadBase64 } from "./apiClient";

export const downloadUserFile = async (userFile: IUserFile) => {
  const base64String = await fileDownloadBase64(userFile.id);
  if (base64String) {
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", userFile.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
