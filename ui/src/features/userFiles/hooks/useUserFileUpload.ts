import { uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import { UserFile } from "@/features/userFiles/models/userFile";
import { CollectionLimits } from "@/shared/config/collectionLimits";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import type { ChangeEvent } from "react";
import { useCallback, useRef } from "react";

interface UseUserFileUploadOptions {
  onUploaded: (files: UserFile[]) => void;
  tenantGlobalId: string | null;
}

export const useUserFileUpload = ({ onUploaded, tenantGlobalId }: UseUserFileUploadOptions) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadAction = useAsyncAction(ActionLoaders.userFiles.upload(tenantGlobalId ?? undefined));

  const openFileDialog = useCallback(() => {
    fileInput.current?.click();
  }, []);

  const handleFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.currentTarget.files ?? []);
      event.currentTarget.value = "";
      if (!tenantGlobalId || selectedFiles.length === 0) {
        return;
      }

      if (
        selectedFiles.length > CollectionLimits.files ||
        selectedFiles.some((file) => !file.name.trim() || file.name.length > FieldLimits.name)
      ) {
        notification.warning(
          `Choose at most ${CollectionLimits.files} files with filenames no longer than ${FieldLimits.name} characters.`,
        );
        return;
      }
      const uploadedFiles = await uploadAction.run(() => uploadUserFiles(tenantGlobalId, selectedFiles));
      if (uploadedFiles?.length) {
        onUploaded(uploadedFiles);
      }
    },
    [onUploaded, tenantGlobalId, uploadAction],
  );

  return {
    fileInput,
    handleFilesChange,
    isUploading: uploadAction.isRunning,
    openFileDialog,
  };
};
