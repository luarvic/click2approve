import { downloadApprovalRequestFileBase64 } from "@/features/approvalRequests/api/approvalRequestFilesApi";
import { downloadApprovalRequestTaskFileBase64 } from "@/features/approvalRequests/api/approvalRequestTaskFilesApi";
import { downloadUserFileBase64 } from "@/features/userFiles/api/userFilesApi";
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

export const downloadUserFile = async (tenantGlobalId: string, userFile: UserFile) => {
  return downloadFile(userFile, () =>
    downloadUserFileBase64(tenantGlobalId, userFile.globalId),
  );
};

export const downloadApprovalRequestFile = async (
  tenantGlobalId: string,
  userFile: UserFile,
  approvalRequestGlobalId: string,
) =>
  downloadFile(userFile, () =>
    downloadApprovalRequestFileBase64(tenantGlobalId, userFile.globalId, approvalRequestGlobalId),
  );

export const downloadApprovalRequestTaskFile = async (
  tenantGlobalId: string,
  userFile: UserFile,
  approvalRequestTaskGlobalId: string,
) =>
  downloadFile(userFile, () =>
    downloadApprovalRequestTaskFileBase64(
      tenantGlobalId,
      userFile.globalId,
      approvalRequestTaskGlobalId,
    ),
  );

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
