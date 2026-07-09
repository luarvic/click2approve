import { downloadUserFileBase64 } from "@/features/userFiles/api/userFileApi";
import { UserFile } from "@/features/userFiles/models/userFile";

export const downloadUserFile = async (userFile: UserFile) => {
  const base64String = await downloadUserFileBase64(userFile.id);
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
