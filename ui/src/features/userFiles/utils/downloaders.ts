import {
  downloadApprovalRequestFileBase64,
  downloadApprovalRequestTaskFileBase64,
  downloadUserFileBase64,
} from "@/features/userFiles/api/userFileApi";
import { UserFile } from "@/features/userFiles/models/userFile";

const browserOpenableExtensions = new Set([
  ".apng",
  ".avif",
  ".bmp",
  ".csv",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".json",
  ".md",
  ".mp3",
  ".mp4",
  ".ogg",
  ".pdf",
  ".png",
  ".txt",
  ".wav",
  ".webm",
  ".webp",
  ".xml",
]);

export const downloadUserFile = async (userFile: UserFile) => {
  return downloadFile(userFile, () => downloadUserFileBase64(userFile.id));
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
  const previewTab = canOpenInBrowser(userFile)
    ? window.open("about:blank", "_blank")
    : null;
  if (previewTab) {
    previewTab.opener = null;
  }

  const base64String = await download();
  if (!base64String) {
    previewTab?.close();
    return;
  }

  if (previewTab) {
    const objectUrl = createObjectUrl(base64String);
    if (!objectUrl) {
      previewTab.close();
      triggerDownload(userFile, base64String);
      return;
    }

    previewTab.location.href = objectUrl;
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    return;
  }

  triggerDownload(userFile, base64String);
};

const canOpenInBrowser = (userFile: UserFile) => {
  const extension = userFile.type || getFileExtension(userFile.name);
  return browserOpenableExtensions.has(extension.toLowerCase());
};

const getFileExtension = (fileName: string) => {
  const extensionStart = fileName.lastIndexOf(".");
  if (extensionStart < 0) {
    return "";
  }

  return fileName.slice(extensionStart);
};

const triggerDownload = (userFile: UserFile, base64String: string) => {
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

const createObjectUrl = (base64String: string) => {
  const match = /^data:([^;]+);base64,(.*)$/.exec(base64String);
  if (!match) {
    return null;
  }

  const [, contentType, base64Content] = match;
  const binaryContent = window.atob(base64Content);
  const bytes = new Uint8Array(binaryContent.length);
  for (let index = 0; index < binaryContent.length; index += 1) {
    bytes[index] = binaryContent.charCodeAt(index);
  }

  return URL.createObjectURL(new Blob([bytes], { type: contentType }));
};
