import { deleteUserFile } from "@/features/userFiles/api/userFilesApi";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { useCallback } from "react";

export const useUserFileDelete = (tenantGlobalId: string | null) => {
  const deleteAction = useAsyncAction();

  const deleteFile = useCallback(
    async (userFileGlobalId: string): Promise<boolean> => {
      if (!tenantGlobalId) {
        return false;
      }

      return (
        (await deleteAction.run(
          () => deleteUserFile(tenantGlobalId, userFileGlobalId),
          ActionLoaders.userFiles.delete(userFileGlobalId),
        )) ?? false
      );
    },
    [deleteAction, tenantGlobalId],
  );

  return { deleteFile, isDeleting: deleteAction.isRunning };
};
