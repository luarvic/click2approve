import { IUserFile } from "../models/UserFile";
import { downloadFileBase64 } from "./ApiClient";

export const downloadUserFile = async (userFile: IUserFile) => {
  const base64String = await downloadFileBase64(userFile.id);
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
