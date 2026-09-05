import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { Files } from "@/shared/components/files/fileInputStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Stack, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

interface DiscussionComposerProps {
  attachmentsAreEnabled: boolean;
  body: string;
  files: UserFile[];
  onBodyChange: (body: string) => void;
  onFilesChange: Dispatch<SetStateAction<UserFile[]>>;
  onSend: () => Promise<void>;
  tenantGlobalId: string | null;
}

const DiscussionComposer: React.FC<DiscussionComposerProps> = ({
  attachmentsAreEnabled,
  body,
  files,
  onBodyChange,
  onFilesChange,
  onSend,
  tenantGlobalId,
}) => {
  const fileDeletion = useUserFileDelete(tenantGlobalId);
  const onFilesUploaded = useCallback(
    (uploadedFiles: UserFile[]) => onFilesChange((currentFiles) => [...currentFiles, ...uploadedFiles]),
    [onFilesChange],
  );
  const fileUpload = useUserFileUpload({ onUploaded: onFilesUploaded, tenantGlobalId });
  const isManagingFiles = fileDeletion.isDeleting || fileUpload.isUploading;
  const removeFile = async (index: number) => {
    const file = files[index];
    if (!file || !tenantGlobalId) {
      return;
    }

    const removed = await fileDeletion.deleteFile(file.globalId);
    if (removed) {
      onFilesChange((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
    }
  };

  return (
    <Stack alignItems="flex-start" spacing={StackSpacing.tight}>
      <TextField
        fullWidth
        label="Message"
        multiline
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void onSend();
          }
        }}
      />
      {attachmentsAreEnabled && (
        <ApprovalRequestFilesList
          existingFiles={[]}
          isActionsDisabled={isManagingFiles}
          newFiles={files}
          onRemoveNew={(index) => void removeFile(index)}
        />
      )}
      {attachmentsAreEnabled && (
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
};

export default DiscussionComposer;
