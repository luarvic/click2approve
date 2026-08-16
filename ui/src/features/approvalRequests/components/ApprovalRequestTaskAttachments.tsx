import {
  addApprovalRequestTaskAttachments,
  removeApprovalRequestTaskAttachment,
} from "@/features/approvalRequests/api/approvalRequestTaskAttachmentsApi";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import { deleteUserFile, uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestTaskAttachment } from "@/features/userFiles/utils/downloaders";
import { Files, StackSpacing } from "@/shared/constants/constants";
import { AttachFile } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

interface ApprovalRequestTaskAttachmentsProps {
  canManageFiles: boolean;
  label?: string;
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
>(({ canManageFiles, label = "Files to attach", showLabel = true, taskFiles, taskGlobalId, tenantGlobalId }, ref) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UserFile[]>(taskFiles);
  const [newFiles, setNewFiles] = useState<UserFile[]>([]);

  const attach = useCallback(async (): Promise<boolean> => {
    if (newFiles.length === 0) return true;
    if (
      !(await addApprovalRequestTaskAttachments(
        tenantGlobalId,
        taskGlobalId,
        newFiles.map((file) => file.globalId),
      ))
    )
      return false;

    setNewFiles([]);
    setFiles((files) => [...files, ...newFiles]);
    return true;
  }, [newFiles, taskGlobalId, tenantGlobalId]);

  useImperativeHandle(ref, () => ({ attach }), [attach]);

  return (
    <Stack alignItems="flex-start" spacing={StackSpacing.default}>
      {showLabel && <ApprovalRequestParticipantLabel>{label}</ApprovalRequestParticipantLabel>}
      <ApprovalRequestFilesList
        existingFiles={files.map((file) => ({ file }))}
        newFiles={newFiles}
        onDownloadExisting={(file) => void downloadApprovalRequestTaskAttachment(tenantGlobalId, file, taskGlobalId)}
        onRemoveExisting={
          canManageFiles
            ? (index) => {
                const file = files[index];
                if (!file) return;
                void removeApprovalRequestTaskAttachment(tenantGlobalId, taskGlobalId, file.globalId).then(
                  (removed) => {
                    if (removed) {
                      setFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
                    }
                  },
                );
              }
            : undefined
        }
        onRemoveNew={(index) => {
          const file = newFiles[index];
          if (!file) return;
          void deleteUserFile(tenantGlobalId, file.globalId).then((removed) => {
            if (removed) {
              setNewFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
            }
          });
        }}
      />
      {canManageFiles && (
        <>
          <Button startIcon={<AttachFile />} onClick={() => fileInput.current?.click()}>
            Attach files
          </Button>
          <input
            multiple
            ref={fileInput}
            style={Files.inputStyle}
            type="file"
            onChange={async (event) => {
              const selectedFiles = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (selectedFiles.length === 0) return;

              const uploadedFiles = await uploadUserFiles(tenantGlobalId, selectedFiles);
              setNewFiles((files) => [...files, ...uploadedFiles]);
            }}
          />
        </>
      )}
    </Stack>
  );
});

export default ApprovalRequestTaskAttachments;
