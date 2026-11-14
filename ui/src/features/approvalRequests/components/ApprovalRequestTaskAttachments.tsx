import {
  addApprovalRequestTaskAttachments,
  removeApprovalRequestTaskAttachment,
} from "@/features/approvalRequests/api/approvalRequestTaskAttachmentsApi";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFileControls from "@/features/approvalRequests/components/ApprovalRequestFileControls";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestTaskAttachment } from "@/features/userFiles/utils/downloaders";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import type { Dispatch, SetStateAction } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

interface ApprovalRequestTaskAttachmentsProps {
  canManageFiles: boolean;
  label?: string;
  newFiles: UserFile[];
  onNewFilesChange: Dispatch<SetStateAction<UserFile[]>>;
  showLabel?: boolean;
  taskGlobalId: string;
  taskFiles: UserFile[];
  tenantGlobalId: string;
}

export interface ApprovalRequestTaskAttachmentsHandle {
  attach: () => Promise<boolean>;
}

const ApprovalRequestTaskAttachments = forwardRef<
  ApprovalRequestTaskAttachmentsHandle,
  ApprovalRequestTaskAttachmentsProps
>(
  (
    {
      canManageFiles,
      label = "Files to attach",
      newFiles,
      onNewFilesChange,
      showLabel = true,
      taskFiles,
      taskGlobalId,
      tenantGlobalId,
    },
    ref,
  ) => {
    const [files, setFiles] = useState<UserFile[]>(taskFiles);
    const attachAction = useAsyncAction(ActionLoaders.approvalRequestTasks.attachFiles(taskGlobalId));
    const fileDeletion = useUserFileDelete(tenantGlobalId);
    const removeAttachmentAction = useAsyncAction();
    const fileUpload = useUserFileUpload({
      taskGlobalId,
      onUploaded: (uploadedFiles) => onNewFilesChange((currentFiles) => [...currentFiles, ...uploadedFiles]),
      tenantGlobalId,
    });

    useEffect(() => {
      setFiles(taskFiles);
    }, [taskFiles]);

    const attach = useCallback(async (): Promise<boolean> => {
      if (newFiles.length === 0) return true;
      const attached = await attachAction.run(() =>
        addApprovalRequestTaskAttachments(
          tenantGlobalId,
          taskGlobalId,
          newFiles.map((file) => file.globalId),
        ),
      );
      if (!attached) {
        return false;
      }

      onNewFilesChange([]);
      setFiles((files) => [...files, ...newFiles]);
      return true;
    }, [attachAction, newFiles, onNewFilesChange, taskGlobalId, tenantGlobalId]);

    useImperativeHandle(ref, () => ({ attach }), [attach]);

    const removeAttachedFile = async (index: number) => {
      const file = files[index];
      if (!file) {
        return;
      }

      const removed = await removeAttachmentAction.run(
        () => removeApprovalRequestTaskAttachment(tenantGlobalId, taskGlobalId, file.globalId),
        ActionLoaders.approvalRequestTasks.removeAttachment(taskGlobalId, file.globalId),
      );
      if (removed) {
        setFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
      }
    };

    const removeNewFile = async (index: number) => {
      const file = newFiles[index];
      if (!file) {
        return;
      }

      const removed = await fileDeletion.deleteFile(file.globalId);
      if (removed) {
        onNewFilesChange((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
      }
    };

    const isManagingFiles =
      attachAction.isRunning || fileDeletion.isDeleting || removeAttachmentAction.isRunning || fileUpload.isUploading;

    const fileControls = (
      <ApprovalRequestFileControls
        files={files}
        newFiles={newFiles}
        disabled={isManagingFiles}
        uploading={fileUpload.isUploading}
        onDownload={(file) => void downloadApprovalRequestTaskAttachment(tenantGlobalId, file, taskGlobalId)}
        onRemove={canManageFiles ? (index) => void removeAttachedFile(index) : undefined}
        onRemoveNew={(index) => void removeNewFile(index)}
        onUpload={canManageFiles ? (files) => void fileUpload.uploadFiles(files) : undefined}
      />
    );

    return showLabel ? <ApprovalRequestField label={label} value={fileControls} /> : fileControls;
  },
);

export default ApprovalRequestTaskAttachments;
