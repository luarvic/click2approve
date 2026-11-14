import DiscussionComposerField from "@/features/discussions/components/DiscussionComposerField";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { Files } from "@/shared/components/files/fileInputStyles";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { Stack } from "@mui/material";
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
      <DiscussionComposerField
        attachmentsAreEnabled={attachmentsAreEnabled}
        body={body}
        error={error}
        disabled={isManagingFiles}
        uploading={fileUpload.isUploading}
        onAttachFiles={fileUpload.openFileDialog}
        onBodyChange={onBodyChange}
        onSend={onSend}
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
