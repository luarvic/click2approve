import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { Files } from "@/shared/components/files/fileInputStyles";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { AttachFile } from "@mui/icons-material";
import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

interface DiscussionComposerProps {
  error?: string;
  taskGlobalId?: string;
  requestGlobalId?: string;
  attachmentsAreEnabled: boolean;
  body: string;
  files: UserFile[];
  onBodyChange: (body: string) => void;
  onFilesChange: Dispatch<SetStateAction<UserFile[]>>;
  onSend: () => Promise<void>;
  tenantGlobalId: string | null;
}

const attachmentAdornmentSx = { alignSelf: "flex-end", mb: 0.5 } as const;

const DiscussionComposer: React.FC<DiscussionComposerProps> = ({
  attachmentsAreEnabled,
  taskGlobalId,
  requestGlobalId,
  error,
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
  const fileUpload = useUserFileUpload({ onUploaded: onFilesUploaded, tenantGlobalId, taskGlobalId, requestGlobalId });
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
    <Stack spacing={StackSpacing.tight} sx={Flex.alignStartSx}>
      <TextField
        fullWidth
        label="Message"
        error={Boolean(error)}
        helperText={error}
        multiline
        slotProps={{
          input: {
            endAdornment: attachmentsAreEnabled ? (
              <InputAdornment position="end" sx={attachmentAdornmentSx}>
                <IconButton
                  aria-label="Attach files"
                  color="primary"
                  disabled={isManagingFiles}
                  loading={fileUpload.isUploading}
                  onClick={fileUpload.openFileDialog}
                  size="small"
                  title="Attach files"
                >
                  <AttachFile fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        onKeyDown={(event) => {
          const isMessageInput =
            event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;
          if (isMessageInput && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
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
        <input
          multiple
          ref={fileUpload.fileInput}
          style={Files.inputStyle}
          type="file"
          onChange={fileUpload.handleFilesChange}
        />
      )}
    </Stack>
  );
};

export default DiscussionComposer;
