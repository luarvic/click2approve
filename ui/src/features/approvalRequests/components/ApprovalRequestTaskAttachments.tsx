import {
  addApprovalRequestTaskAttachments,
  removeApprovalRequestTaskAttachment,
} from "@/features/approvalRequests/api/approvalRequestTaskAttachmentsApi";
import ApprovalRequestDetailLabel from "@/features/approvalRequests/components/ApprovalRequestDetailLabel";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestTaskAttachment } from "@/features/userFiles/utils/downloaders";
import { Files, StackSpacing } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Stack } from "@mui/material";
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

    return (
      <Stack alignItems="flex-start" spacing={StackSpacing.default}>
        {showLabel && <ApprovalRequestDetailLabel>{label}</ApprovalRequestDetailLabel>}
        <ApprovalRequestFilesList
          existingFiles={files.map((file) => ({ file }))}
          isActionsDisabled={isManagingFiles}
          newFiles={newFiles}
          onDownloadExisting={(file) => void downloadApprovalRequestTaskAttachment(tenantGlobalId, file, taskGlobalId)}
          onRemoveExisting={canManageFiles ? (index) => void removeAttachedFile(index) : undefined}
          onRemoveNew={(index) => void removeNewFile(index)}
        />
        {canManageFiles && (
          <>
            <LoadingButton
              disabled={isManagingFiles}
              loading={fileUpload.isUploading}
              startIcon={<AttachFile />}
              onClick={fileUpload.openFileDialog}
            >
              Attach files
            </LoadingButton>
            <input
              multiple
              ref={fileUpload.fileInput}
              style={Files.inputStyle}
              type="file"
              onChange={fileUpload.handleFilesChange}
            />
          </>
        )}
      </Stack>
    );
  },
);

export default ApprovalRequestTaskAttachments;
