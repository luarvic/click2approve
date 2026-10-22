import { downloadApprovalRequestFileBase64 } from "@/features/approvalRequests/api/approvalRequestFilesApi";
import { downloadApprovalRequestTaskAttachmentBase64 } from "@/features/approvalRequests/api/approvalRequestTaskAttachmentsApi";
import { downloadApprovalRequestTaskFileBase64 } from "@/features/approvalRequests/api/approvalRequestTaskFilesApi";
import { downloadDiscussionMessageFileBase64 } from "@/features/discussions/api/discussionsApi";
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
]);

const browserOpenableContentTypes = new Set([
  "application/pdf",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "image/apng",
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/vnd.microsoft.icon",
  "image/webp",
  "image/x-icon",
  "video/mp4",
  "video/ogg",
  "video/webm",
]);

const textContentTypes = new Set(["application/json", "text/csv", "text/markdown", "text/plain"]);

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
    downloadApprovalRequestTaskFileBase64(tenantGlobalId, userFile.globalId, approvalRequestTaskGlobalId),
  );

export const downloadApprovalRequestTaskAttachment = async (
  tenantGlobalId: string,
  userFile: UserFile,
  approvalRequestTaskGlobalId: string,
) =>
  downloadFile(userFile, () =>
    downloadApprovalRequestTaskAttachmentBase64(tenantGlobalId, approvalRequestTaskGlobalId, userFile.globalId),
  );

export const downloadDiscussionMessageFile = async (
  tenantGlobalId: string,
  userFile: UserFile,
  messageGlobalId: string,
) =>
  downloadFile(userFile, () => downloadDiscussionMessageFileBase64(tenantGlobalId, messageGlobalId, userFile.globalId));

const downloadFile = async (userFile: UserFile, download: () => Promise<string | null>) => {
  const previewTab = canOpenInBrowser(userFile) ? window.open("about:blank", "_blank") : null;
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
  const extension = getFileExtension(userFile.name).toLowerCase();
  return (
    browserOpenableExtensions.has(extension) &&
    (!userFile.type || browserOpenableExtensions.has(userFile.type.toLowerCase()))
  );
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
  const normalizedContentType = contentType.toLowerCase();
  // Never navigate to active document types, even when the file extension looks safe.
  const previewContentType = textContentTypes.has(normalizedContentType) ? "text/plain" : normalizedContentType;
  if (previewContentType !== "text/plain" && !browserOpenableContentTypes.has(previewContentType)) {
    return null;
  }

  const binaryContent = window.atob(base64Content);
  const bytes = new Uint8Array(binaryContent.length);
  for (let index = 0; index < binaryContent.length; index += 1) {
    bytes[index] = binaryContent.charCodeAt(index);
  }

  return URL.createObjectURL(new Blob([bytes], { type: previewContentType }));
};
