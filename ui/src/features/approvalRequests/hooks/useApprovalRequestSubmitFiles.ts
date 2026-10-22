import { RevisionExistingFile } from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { useUserFileDelete } from "@/features/userFiles/hooks/useUserFileDelete";
import { useUserFileUpload } from "@/features/userFiles/hooks/useUserFileUpload";
import { UserFile } from "@/features/userFiles/models/userFile";
import type { ChangeEvent } from "react";
import { useState } from "react";

interface UseApprovalRequestSubmitFilesOptions {
  initialExistingFiles: RevisionExistingFile[];
  initialNewFiles: UserFile[];
  isRevision: boolean;
  tenantGlobalId: string | null;
}

export const useApprovalRequestSubmitFiles = ({
  initialExistingFiles,
  initialNewFiles,
  isRevision,
  tenantGlobalId,
}: UseApprovalRequestSubmitFilesOptions) => {
  const [existingFiles, setExistingFiles] = useState(initialExistingFiles);
  const [newFiles, setNewFiles] = useState(initialNewFiles);
  const [replacementFileIndex, setReplacementFileIndex] = useState<number | null>(null);
  const fileDeletion = useUserFileDelete(tenantGlobalId);
  const addedFilesUpload = useUserFileUpload({
    onUploaded: (uploadedFiles) => setNewFiles((currentFiles) => [...currentFiles, ...uploadedFiles]),
    tenantGlobalId,
  });
  const replacementFilesUpload = useUserFileUpload({
    onUploaded: ([replacement]) => {
      if (replacementFileIndex === null || !replacement) {
        return;
      }

      setExistingFiles((files) =>
        files.map((file, index) => (index === replacementFileIndex ? { ...file, removed: false, replacement } : file)),
      );
    },
    tenantGlobalId,
  });

  const handleReplacementFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await replacementFilesUpload.handleFilesChange(event);
    setReplacementFileIndex(null);
  };

  const removeExistingFile = (index: number) => {
    if (!existingFiles[index]) {
      return;
    }

    setExistingFiles((files) =>
      isRevision
        ? files.map((file, fileIndex) =>
            fileIndex === index ? { ...file, removed: true, replacement: undefined } : file,
          )
        : files.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const removeNewFile = async (index: number) => {
    const file = newFiles[index];
    if (!file || !tenantGlobalId) {
      setNewFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
      return;
    }

    if (await fileDeletion.deleteFile(file.globalId)) {
      setNewFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    }
  };

  const removeReplacementFile = async (index: number) => {
    const replacement = existingFiles[index]?.replacement;
    if (!replacement || !tenantGlobalId) {
      setExistingFiles((files) =>
        files.map((file, fileIndex) => (fileIndex === index ? { ...file, replacement: undefined } : file)),
      );
      return;
    }

    if (await fileDeletion.deleteFile(replacement.globalId)) {
      setExistingFiles((files) =>
        files.map((file, fileIndex) => (fileIndex === index ? { ...file, replacement: undefined } : file)),
      );
    }
  };

  const restoreExistingFile = (index: number) => {
    setExistingFiles((files) =>
      files.map((file, fileIndex) => (fileIndex === index ? { ...file, removed: false } : file)),
    );
  };

  const startReplacingExistingFile = (index: number) => {
    setReplacementFileIndex(index);
    replacementFilesUpload.openFileDialog();
  };

  const clear = () => {
    setNewFiles([]);
    setExistingFiles([]);
    setReplacementFileIndex(null);
  };

  return {
    addedFilesUpload,
    clear,
    existingFiles,
    fileDeletion,
    handleReplacementFilesChange,
    newFiles,
    removeExistingFile,
    removeNewFile,
    removeReplacementFile,
    replacementFilesUpload,
    restoreExistingFile,
    setExistingFiles,
    setNewFiles,
    startReplacingExistingFile,
  };
};
