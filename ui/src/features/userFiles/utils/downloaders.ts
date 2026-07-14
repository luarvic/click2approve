import {
  downloadApprovalRequestFileBase64,
  downloadApprovalRequestTaskFileBase64,
  downloadUserFileBase64,
} from "@/features/userFiles/api/userFileApi";
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

export const downloadApprovalRequestFile = async (
  userFile: UserFile,
  approvalRequestId: number,
) => downloadFile(userFile, () => downloadApprovalRequestFileBase64(userFile.id, approvalRequestId));

export const downloadApprovalRequestTaskFile = async (
  userFile: UserFile,
  approvalRequestTaskId: number,
) => downloadFile(userFile, () => downloadApprovalRequestTaskFileBase64(userFile.id, approvalRequestTaskId));

const downloadFile = async (
  userFile: UserFile,
  download: () => Promise<string | null>,
) => {
  const base64String = await download();
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
